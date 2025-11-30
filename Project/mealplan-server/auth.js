import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';

export function setupAuth(pool) {
  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const googleId = profile.id;
          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';

          // Check if user exists
          const [existingUsers] = await pool.query(
            'SELECT user_id, email FROM users WHERE email = ? OR google_id = ?',
            [email, googleId]
          );

          let user;

          if (existingUsers.length > 0) {
            // User exists - update google_id if not set
            user = existingUsers[0];

            if (!user.google_id) {
              await pool.query(
                'UPDATE users SET google_id = ?, last_login = NOW() WHERE user_id = ?',
                [googleId, user.user_id]
              );
            } else {
              await pool.query(
                'UPDATE users SET last_login = NOW() WHERE user_id = ?',
                [user.user_id]
              );
            }
          } else {
            // Create new user
            const [result] = await pool.query(
              'INSERT INTO users (email, google_id, first_name, last_name, created_at, last_login) VALUES (?, ?, ?, ?, NOW(), NOW())',
              [email, googleId, firstName, lastName]
            );

            user = {
              user_id: result.insertId,
              email,
            };

            // Create default views for new user
            await createDefaultViewsForUser(pool, user.user_id);
          }

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.user_id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const [users] = await pool.query('SELECT user_id, email FROM users WHERE user_id = ?', [id]);
      if (users.length > 0) {
        done(null, users[0]);
      } else {
        done(new Error('User not found'), null);
      }
    } catch (error) {
      done(error, null);
    }
  });
}

// Create default views and labels for new user
async function createDefaultViewsForUser(pool, userId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Create "By Location" view
    const [locationView] = await connection.query(
      'INSERT INTO views (user_id, name, type, is_default) VALUES (?, ?, ?, ?)',
      [userId, 'By Location', 'location', true]
    );
    const locationViewId = locationView.insertId;

    // Create location labels
    const locationLabels = [
      { name: 'SLC', color: '#3B82F6', type: 'location' },
      { name: 'V1', color: '#EF4444', type: 'location' },
      { name: 'REV', color: '#10B981', type: 'location' },
      { name: 'Plaza', color: '#F59E0B', type: 'location' },
      { name: 'DC Library', color: '#8B5CF6', type: 'location' },
      { name: 'DP Library', color: '#EC4899', type: 'location' },
      { name: 'Other', color: '#6B7280', type: 'location' },
    ];

    for (const label of locationLabels) {
      await connection.query(
        'INSERT INTO labels (user_id, view_id, name, color, type) VALUES (?, ?, ?, ?, ?)',
        [userId, locationViewId, label.name, label.color, label.type]
      );
    }

    // Create "Meal Plan vs Flex" view
    const [flexView] = await connection.query(
      'INSERT INTO views (user_id, name, type, is_default) VALUES (?, ?, ?, ?)',
      [userId, 'Meal Plan vs Flex', 'mealplan-flex', false]
    );
    const flexViewId = flexView.insertId;

    // Create flex labels
    const flexLabels = [
      { name: 'Meal Plan', color: '#3B82F6', type: 'location' },
      { name: 'Flex', color: '#F59E0B', type: 'flex' },
      { name: 'Other', color: '#6B7280', type: 'custom' },
    ];

    for (const label of flexLabels) {
      await connection.query(
        'INSERT INTO labels (user_id, view_id, name, color, type) VALUES (?, ?, ?, ?, ?)',
        [userId, flexViewId, label.name, label.color, label.type]
      );
    }

    await connection.commit();
    console.log(`✅ Created default views for user ${userId}`);
  } catch (error) {
    await connection.rollback();
    console.error('❌ Failed to create default views:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Generate JWT token
export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.userId = decoded.userId;
    next();
  });
}
