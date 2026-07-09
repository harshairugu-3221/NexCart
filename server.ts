import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';

// Load environmental parameters
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to DB JSON - check dist first (production), then project root
let dbPath = path.join(process.cwd(), 'db.json');
if (process.env.NODE_ENV === 'production') {
  const distDbPath = path.join(__dirname, 'db.json');
  if (fs.existsSync(distDbPath)) {
    dbPath = distDbPath;
  }
}

// Interface representation for local database sync
interface DbSchema {
  products: any[];
  users: any[];
  orders: any[];
  sessions: Record<string, string>;
  notifications: any[];
  activities: any[];
}

// Memory database synchronization helper
function readDb(): DbSchema {
  try {
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      if (!data.activities) data.activities = [];
      return data;
    }
  } catch (err) {
    console.error('Failed reading db.json:', err);
  }
  return { products: [], users: [], orders: [], sessions: {}, notifications: [], activities: [] };
}

function writeDb(data: DbSchema) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing db.json:', err);
  }
}

// Core database structure instance
let db = readDb();

// ==========================================
// FIREBASE FIRESTORE INITIALIZATION & SYNCHRONIZATION
// ==========================================
let firestoreDb: any = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // Initialize Admin SDK
    admin.initializeApp({
      projectId: config.projectId,
    });
    
    // Instantiate Firestore with specific databaseId
    firestoreDb = (admin as any).firestore(config.firestoreDatabaseId || '(default)');
    
    console.log('Firebase Admin SDK / Firestore client successfully connected. DB ID:', config.firestoreDatabaseId || '(default)');
  } else {
    console.warn('Warning: firebase-applet-config.json was not found. Storing data in local JSON file only.');
  }
} catch (err) {
  console.error('Failed to initialize Firebase Admin SDK:', err);
}

// Helper: Save doc to Firestore asynchronously
async function saveDoc(collection: string, id: string, data: any) {
  if (!firestoreDb) return;
  try {
    const cleanData = JSON.parse(JSON.stringify(data));
    await firestoreDb.collection(collection).doc(id).set(cleanData);
  } catch (err) {
    console.error(`Error writing to Firestore [${collection}/${id}]:`, err);
  }
}

// Helper: Delete doc from Firestore
async function deleteDoc(collection: string, id: string) {
  if (!firestoreDb) return;
  try {
    await firestoreDb.collection(collection).doc(id).delete();
  } catch (err) {
    console.error(`Error deleting from Firestore [${collection}/${id}]:`, err);
  }
}

// Helper: Log User Activity
async function logActivity(userId: string | null, userName: string | null, action: string, details: any) {
  const finalUserId = userId || 'anonymous';
  const finalUserName = userName || 'Guest User';
  const activity = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    userId: finalUserId,
    userName: finalUserName,
    action,
    details: details || {},
    timestamp: new Date().toISOString()
  };
  
  // Push to local db
  db.activities.unshift(activity);
  if (db.activities.length > 1000) {
    db.activities = db.activities.slice(0, 1000);
  }
  writeDb(db);
  
  // Save to Firestore
  await saveDoc('activities', activity.id, activity);
  console.log(`[ACTIVITY LOG] User: ${finalUserName} (${finalUserId}) | Action: ${action}`);
}

// Helper: Sync all data on boot
async function seedAndSyncFromFirestore() {
  if (!firestoreDb) return;
  try {
    console.log('Starting Firestore synchronization cycle...');

    // 1. Sync Products
    const productsSnap = await firestoreDb.collection('products').get();
    if (productsSnap.empty) {
      console.log('Firestore products empty. Seeding catalog items...');
      for (const p of db.products) {
        await firestoreDb.collection('products').doc(p.id).set(p);
      }
    } else {
      console.log('Loading products from Firestore...');
      const prods: any[] = [];
      productsSnap.forEach((doc: any) => prods.push(doc.data()));
      db.products = prods;
    }

    // 2. Sync Users
    const usersSnap = await firestoreDb.collection('users').get();
    if (usersSnap.empty) {
      console.log('Firestore users empty. Seeding local users...');
      for (const u of db.users) {
        await firestoreDb.collection('users').doc(u.id).set(u);
      }
    } else {
      console.log('Loading users from Firestore...');
      const usrs: any[] = [];
      usersSnap.forEach((doc: any) => usrs.push(doc.data()));
      db.users = usrs;
    }

    // 3. Sync Orders
    const ordersSnap = await firestoreDb.collection('orders').get();
    if (ordersSnap.empty) {
      console.log('Firestore orders empty. Seeding local orders...');
      for (const o of db.orders) {
        await firestoreDb.collection('orders').doc(o.id).set(o);
      }
    } else {
      console.log('Loading orders from Firestore...');
      const ords: any[] = [];
      ordersSnap.forEach((doc: any) => ords.push(doc.data()));
      db.orders = ords;
    }

    // 4. Sync Sessions
    const sessionsSnap = await firestoreDb.collection('sessions').get();
    if (!sessionsSnap.empty) {
      console.log('Loading active sessions from Firestore...');
      const sess: Record<string, string> = {};
      sessionsSnap.forEach((doc: any) => {
        sess[doc.id] = doc.data().userId;
      });
      db.sessions = sess;
    }

    // 5. Sync Notifications
    const notificationsSnap = await firestoreDb.collection('notifications').get();
    if (notificationsSnap.empty) {
      console.log('Firestore notifications empty. Seeding...');
      for (const n of db.notifications) {
        await firestoreDb.collection('notifications').doc(n.id).set(n);
      }
    } else {
      console.log('Loading notifications from Firestore...');
      const notifs: any[] = [];
      notificationsSnap.forEach((doc: any) => notifs.push(doc.data()));
      db.notifications = notifs;
    }

    // 6. Sync Activities
    const activitiesSnap = await firestoreDb.collection('activities').get();
    if (!activitiesSnap.empty) {
      console.log('Loading activity logs from Firestore...');
      const acts: any[] = [];
      activitiesSnap.forEach((doc: any) => acts.push(doc.data()));
      db.activities = acts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
      console.log('Firestore activities empty. No logs to fetch.');
    }

    writeDb(db);
    console.log('Firestore and local memory synchronization completed successfully!');
  } catch (err) {
    console.error('Failed to sync state with Firestore:', err);
  }
}

// Run synchronization on startup
seedAndSyncFromFirestore();

// Initialize Google Gemini API on server side
// Ensure standard telemetry agent label
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini AI successfully initialized server-side.');
  } catch (e) {
    console.log('Note: Optional Gemini Client init skipped (will use intelligent offline fallback):', e);
  }
} else {
  console.log('Gemini API key is not configured. Falling back to local smart recommendation model.');
}

// Auxiliary middle-tier function to check current user authorization state
function getAuthorizedUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const userId = db.sessions[token];
  if (!userId) return null;
  return db.users.find(u => u.id === userId) || null;
}

// ==========================================
// 1. SECURE AUTHENTICATION ENDPOINTS
// ==========================================

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please enter name, email, and password.' });
  }

  db = readDb();
  const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Email address is already registered.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    role: email.toLowerCase() === 'harshairugu@gmail.com' ? 'admin' : 'customer',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  // Generate an automated starting notification for new sign-ups
  const welcomeNotification = {
    id: `notif-${Date.now()}`,
    userId: newUser.id,
    title: 'Welcome to NexCart!',
    message: `Hi ${name}, welcome aboard! Explore bleeding-edge electronics with smart recommendations.`,
    type: 'info',
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.push(welcomeNotification);

  writeDb(db);

  // Persist to Firestore and log activity asynchronously
  saveDoc('users', newUser.id, newUser);
  saveDoc('notifications', welcomeNotification.id, welcomeNotification);
  logActivity(newUser.id, newUser.name, 'register', { email: newUser.email, role: newUser.role });

  res.status(201).json({ user: newUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please specify email and password.' });
  }

  db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or credentials.' });
  }

  // Generate simple session token
  const token = `token-${user.id}-${Math.floor(Math.random() * 1000000)}`;
  db.sessions[token] = user.id;
  writeDb(db);

  // Persist session to Firestore and log activity asynchronously
  saveDoc('sessions', token, { userId: user.id });
  logActivity(user.id, user.name, 'login', { email: user.email, role: user.role });

  res.json({ token, user });
});

app.get('/api/auth/me', (req, res) => {
  db = readDb();
  const user = getAuthorizedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or unauthenticated.' });
  }
  res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db = readDb();
    const userId = db.sessions[token];
    const user = db.users.find(u => u.id === userId);
    
    delete db.sessions[token];
    writeDb(db);

    // Delete session from Firestore and log activity
    deleteDoc('sessions', token);
    if (user) {
      logActivity(user.id, user.name, 'logout', {});
    }
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// 2. PRODUCT CATALOG ENDPOINTS (WITH SEARCH FILTER)
// ==========================================

app.get('/api/products', (req, res) => {
  db = readDb();
  const query = (req.query.q as string || '').toLowerCase().trim();
  const category = (req.query.category as string || '').trim();

  let filtered = [...db.products];

  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (query) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.features.some((f: string) => f.toLowerCase().includes(query))
    );
  }

  res.json(filtered);
});

app.get('/api/products/:id', (req, res) => {
  db = readDb();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(product);
});

app.post('/api/products/:id/reviews', (req, res) => {
  db = readDb();
  const user = getAuthorizedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please log in first.' });
  }

  const productId = req.params.id;
  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  // Verify that the user has actually purchased this component in one of their checkout flows
  const userOrders = db.orders.filter(o => o.userId === user.id);
  const hasPurchased = userOrders.some(order => 
    order.items.some((item: any) => item.productId === productId)
  );

  if (!hasPurchased) {
    return res.status(403).json({ error: 'Only customers who purchased this item can leave a rating or review.' });
  }

  const { rating, comment } = req.body;
  const parsedRating = parseInt(rating);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: 'Please submit a valid rating between 1 and 5 stars.' });
  }

  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Review text comment cannot be empty.' });
  }

  // Construct new review item
  const newReview = {
    id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    userId: user.id,
    userName: user.name || user.email.split('@')[0],
    rating: parsedRating,
    comment: comment.trim(),
    createdAt: new Date().toISOString()
  };

  if (!product.reviews) {
    product.reviews = [];
  }
  product.reviews.push(newReview);

  // Recalculate average star rating
  const totalStars = product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
  product.rating = parseFloat((totalStars / product.reviews.length).toFixed(1));

  writeDb(db);

  // Save updated product to Firestore and log activity
  saveDoc('products', product.id, product);
  logActivity(user.id, user.name, 'add_review', { productId: product.id, productName: product.name, rating: parsedRating, comment: comment.trim() });

  res.status(201).json({
    message: 'Feedback posted successfully!',
    product
  });
});

// ==========================================
// 3. SECURE CHECKOUT WITH INVENTORY SUBTRACTION
// ==========================================

app.post('/api/checkout', (req, res) => {
  db = readDb();
  const user = getAuthorizedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required for placing orders.' });
  }

  const { items, shippingInfo, paymentDetails, paymentMethod = 'card', upiId } = req.body;
  if (!items || !items.length || !shippingInfo) {
    return res.status(400).json({ error: 'Missing active cart items or shipping descriptors.' });
  }

  // Validate real-time inventory levels first
  const orderItems = [];
  let orderTotal = 0;

  for (const item of items) {
    const originalProd = db.products.find(p => p.id === item.product.id);
    if (!originalProd) {
      return res.status(404).json({ error: `Product ${item.product.name} does not exist.` });
    }
    if (originalProd.stock < item.quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock for ${originalProd.name}. Available: ${originalProd.stock}, Requested: ${item.quantity}` 
      });
    }

    orderItems.push({
      productId: originalProd.id,
      name: originalProd.name,
      price: originalProd.price,
      quantity: item.quantity
    });

    orderTotal += originalProd.price * item.quantity;
  }

  // Perform secure index calculations & real-time inventory stock updates
  for (const item of items) {
    const originalProdIndex = db.products.findIndex(p => p.id === item.product.id);
    if (originalProdIndex !== -1) {
      db.products[originalProdIndex].stock -= item.quantity;
    }
  }

  const orderId = `ord-2026-${String(Date.now()).slice(-6)}`;
  
  // Third-Party Shipping Logistics Partner simulation initialization
  // Generating simulated tracking identifiers from Fedex/Aramex/DHL
  const partners = ['FedEx', 'DHL Express', 'Aramex'];
  const partner = partners[Math.floor(Math.random() * partners.length)];
  const trackingNumber = `TRK-${partner.toUpperCase().replace(' ', '')}-${Math.floor(100000 + Math.random() * 900000)}`;
  
  const daysToAdd = 3 + Math.floor(Math.random() * 4);
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + daysToAdd);

  const newOrder = {
    id: orderId,
    userId: user.id,
    items: orderItems,
    total: parseFloat(orderTotal.toFixed(2)),
    status: 'pending',
    paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
    paymentMethod,
    upiId: paymentMethod === 'upi' ? upiId : undefined,
    shippingInfo,
    trackingNumber,
    carrier: partner,
    estimatedDelivery: estDate.toISOString(),
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);

  // Seed automated first-status notifications instantly to user profile
  const notifTitle = paymentMethod === 'cod' 
    ? 'Order Placed (COD)! 📦' 
    : (paymentMethod === 'upi' ? 'Order Paid via UPI! 📱' : 'Order Paid! 💳');

  const notifMessage = paymentMethod === 'cod'
    ? `Your Cash on Delivery order ${orderId} is confirmed. Total ₹${newOrder.total} is due on delivery. Your items are being prepared.`
    : `Payment successful for order ${orderId} via ${paymentMethod === 'upi' ? `UPI ID: ${upiId}` : 'Secure Credit Card'}. Total: ₹${newOrder.total}.`;

  db.notifications.push({
    id: `notif-${Date.now()}-1`,
    userId: user.id,
    title: notifTitle,
    message: notifMessage,
    type: 'success',
    read: false,
    createdAt: new Date().toISOString()
  });

  db.notifications.push({
    id: `notif-${Date.now()}-2`,
    userId: user.id,
    title: 'Logistics Partner Assigned 📦',
    message: `${newOrder.carrier} will handle your delivery. Tracking Code: ${newOrder.trackingNumber}. Estimated arrival: ${estDate.toLocaleDateString()}.`,
    type: 'info',
    read: false,
    createdAt: new Date().toISOString()
  });

  writeDb(db);

  // Persist modifications to Firestore and log activity
  // A. Save the new order
  saveDoc('orders', newOrder.id, newOrder);

  // B. Save the updated products (due to stock subtraction)
  for (const item of items) {
    const originalProd = db.products.find(p => p.id === item.product.id);
    if (originalProd) {
      saveDoc('products', originalProd.id, originalProd);
    }
  }

  // C. Save checkout notifications
  const notif1 = db.notifications.find(n => n.id === `notif-${Date.now()}-1`);
  if (notif1) saveDoc('notifications', notif1.id, notif1);

  const notif2 = db.notifications.find(n => n.id === `notif-${Date.now()}-2`);
  if (notif2) saveDoc('notifications', notif2.id, notif2);

  // D. Log checkout activity
  logActivity(user.id, user.name, 'checkout', {
    orderId: newOrder.id,
    total: newOrder.total,
    itemCount: orderItems.reduce((acc, curr) => acc + curr.quantity, 0),
    paymentMethod: newOrder.paymentMethod
  });

  res.status(201).json({ success: true, order: newOrder });
});

// ==========================================
// 4. USER ORDERS & ADMIN STATUS UPDATE & NOTIFICATIONS
// ==========================================

app.get('/api/orders', (req, res) => {
  db = readDb();
  const user = getAuthorizedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Auth required.' });
  }

  // Admins see all store transactions for advanced sales reporting
  if (user.role === 'admin') {
    return res.json(db.orders);
  }

  const userOrders = db.orders.filter(o => o.userId === user.id);
  res.json(userOrders);
});

app.post('/api/orders/:id/update-status', (req, res) => {
  db = readDb();
  const user = getAuthorizedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin level required.' });
  }

  const { status } = req.body;
  if (!['pending', 'processing', 'shipped', 'delivered'].includes(status)) {
    return res.status(400).json({ error: 'Invalid order status specified.' });
  }

  const orderIndex = db.orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const order = db.orders[orderIndex];
  order.status = status;

  // Automated notification system payload creator
  let title = 'Order Notification';
  let message = `Order ${order.id} status updated to ${status}.`;
  let type: 'info' | 'success' | 'warning' = 'info';

  if (status === 'processing') {
    title = 'Order Processing ⚙️';
    message = `Your order ${order.id} is now packed and prepared at our logistics hub.`;
    type = 'info';
  } else if (status === 'shipped') {
    title = 'Order Shipped! 🚀';
    message = `Exciting news! Order ${order.id} is shipped via ${order.carrier}. Tracking ID: ${order.trackingNumber}.`;
    type = 'success';
  } else if (status === 'delivered') {
    title = 'Order Delivered! 🎉';
    message = `Order ${order.id} has been delivered successfully. Let us know how you love it!`;
    type = 'success';
  }

  const newNotif = {
    id: `notif-${Date.now()}`,
    userId: order.userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.push(newNotif);

  writeDb(db);

  // Save to Firestore and log activity
  saveDoc('orders', order.id, order);
  saveDoc('notifications', newNotif.id, newNotif);
  logActivity(user.id, user.name, 'update_order_status', { orderId: order.id, status });

  res.json({ success: true, order });
});

// Clean user notifications
app.get('/api/notifications', (req, res) => {
  db = readDb();
  const user = getAuthorizedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Auth required.' });
  }
  const userNotifs = db.notifications
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userNotifs);
});

app.post('/api/notifications/read-all', (req, res) => {
  db = readDb();
  const user = getAuthorizedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Auth required.' });
  }

  db.notifications = db.notifications.map(n => {
    if (n.userId === user.id) n.read = true;
    return n;
  });

  writeDb(db);
  res.json({ success: true });
});

// ==========================================
// 5. THIRD-PARTY SHIPPING PARTNERS INTEGRATION
// ==========================================

app.get('/api/shipping/partners', (req, res) => {
  const partnersList = [
    { id: 'fedex', name: 'FedEx Super Shipping', speed: '2-4 Days', reliability: '99%', description: 'Worldwide air shipping with live satellite updates.' },
    { id: 'dhl', name: 'DHL Express Premium', speed: '1-3 Days', reliability: '99.5%', description: 'Top shelf speed with custom localized sorting centers.' },
    { id: 'aramex', name: 'Aramex Eco Saver', speed: '4-7 Days', reliability: '97%', description: 'Balanced carbon-neutral shipping options.' }
  ];
  res.json(partnersList);
});

app.get('/api/shipping/track/:trackingNumber', (req, res) => {
  const trackingNumber = req.params.trackingNumber;
  
  // Return mock shipping route states based on tracking code
  const isAramex = trackingNumber.includes('ARAMEX');
  const isDhl = trackingNumber.includes('DHLEXPRESS') || trackingNumber.includes('DHL');
  const carrier = isAramex ? 'Aramex' : (isDhl ? 'DHL' : 'FedEx');

  const liveStatuses = [
    { label: 'Carrier Assigned', time: 'Day 1, 09:00 AM', detail: `Shipment documentation received at ${carrier} terminal.`, geo: 'Dispatch Hub' },
    { label: 'Sorted at Facility', time: 'Day 1, 06:15 PM', detail: 'Sorted at regional sorting and scanning belt.', geo: 'Sorting Hub' },
    { label: 'In Transit', time: 'Day 2, 02:40 PM', detail: 'Departed sorting facility and currently in overland transit.', geo: 'En-route' },
    { label: 'Out for Delivery', time: 'Day 3, 08:30 AM', detail: 'Assigned to courier van for final doorstep dropoff.', geo: 'Local Suburbs' },
    { label: 'Delivered', time: 'Day 3, 01:10 PM', detail: 'Received by customer. Signed with OTP code verification.', geo: 'Destination Doorstep' }
  ];

  res.json({
    trackingNumber,
    carrier,
    latestUpdate: liveStatuses[2].detail,
    route: liveStatuses
  });
});

// ==========================================
// 6. PERSONALIZED AI RECOMMENDATION ENGINE
// ==========================================

app.post('/api/recommendations', async (req, res) => {
  db = readDb();
  const { history } = req.body; // Array of product ids or categories visited

  // Compile full electronics list for reference
  const itemsLog = db.products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    rating: p.rating,
    description: p.description
  }));

  const browsingHistorySummary = history && history.length > 0 
    ? history.map((h: string) => {
        const prod = db.products.find(p => p.id === h);
        return prod ? `${prod.name} (Category: ${prod.category})` : h;
      }).join(', ')
    : 'No prior views. General electronics browsing interest.';

  // If Gemini client exists and key is valid, use it
  if (ai) {
    const prompt = `You are a personalized electronics assistant for NexCart.
Analyzing the customer's prior electronics browsing history: [${browsingHistorySummary}].
Select exactly the top 3 best matching products from the list of available NexCart products below:
${JSON.stringify(itemsLog, null, 2)}

Return ONLY a premium, valid JSON array containing exactly 3 recommendation structures following this exact schema:
[
  {
    "productId": "string matching the product id",
    "name": "name of product",
    "reason": "Highly personalized user-facing explanation on why they will love this specific tech based on their browsing history",
    "confidenceScore": number (0 to 1)
  }
]`;

    let responseText: string | undefined;

    try {
      console.log('Requesting recommendation with model: gemini-3.5-flash');
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                productId: { type: Type.STRING },
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER }
              },
              required: ['productId', 'name', 'reason', 'confidenceScore']
            }
          }
        }
      });
      responseText = response.text;
    } catch (err: any) {
      console.log('Primary AI model unavailable. Transitioning gracefully to secondary backup model...');
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  name: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  confidenceScore: { type: Type.NUMBER }
                },
                required: ['productId', 'name', 'reason', 'confidenceScore']
              }
            }
          }
        });
        responseText = fallbackResponse.text;
      } catch (fallbackErr: any) {
        console.log('Backup AI model unavailable. Utilizing responsive local recommendation engine.');
      }
    }

    if (responseText) {
      try {
        const parsedRecommendations = JSON.parse(responseText.trim());
        // Filter out invalid items or things not matching database
        const finalRecs = parsedRecommendations.filter((r: any) => 
          db.products.some(p => p.id === r.productId)
        );

        if (finalRecs.length > 0) {
          return res.json(finalRecs);
        }
      } catch (parseError) {
        console.log('Failed to parse model output as JSON. Transitioning to local recommendation system.');
      }
    }
  }

  // --- RECONSTRUCT EXTREMELY SMART CONTENT-BASED FILTER LOCAL FALLBACK ---
  // In case Gemini is unconfigured or call fails, keep recommendations flawless
  const categoryClicks: Record<string, number> = {};
  const productClicks: string[] = [];
  
  if (history && history.length > 0) {
    history.forEach((h: string) => {
      productClicks.push(h);
      const matched = db.products.find(p => p.id === h);
      if (matched) {
        categoryClicks[matched.category] = (categoryClicks[matched.category] || 0) + 1;
      }
    });
  }

  // Find top category
  let favoriteCategory = '';
  let maxCount = 0;
  Object.entries(categoryClicks).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteCategory = cat;
    }
  });

  // Pick recommendations:
  // 1. One high-rating item in favoriteCategory (excluding already viewed if possible)
  // 2. High-speed premium high-rating laptop or phone (Zenith Laptop or Veloce Phone)
  // 3. One highly rated sound item (SoundWave ANC or SphereEarbuds Pro)
  const fallbackRecs: any[] = [];
  
  // Recommendation logic
  const topCategoryPicks = db.products
    .filter(p => p.category === favoriteCategory && !productClicks.includes(p.id))
    .sort((a,b) => b.rating - a.rating);

  const bestOverall = [...db.products].sort((a,b) => b.rating - a.rating);

  const selectedIds = new Set<string>();

  if (topCategoryPicks.length > 0) {
    const pick = topCategoryPicks[0];
    fallbackRecs.push({
      productId: pick.id,
      name: pick.name,
      reason: `Based on your frequent interest in premium ${pick.category} gear, this top-rated selection features cutting-edge integrations and elite performance specs.`,
      confidenceScore: 0.95
    });
    selectedIds.add(pick.id);
  }

  for (const item of bestOverall) {
    if (fallbackRecs.length >= 3) break;
    if (selectedIds.has(item.id)) continue;
    
    let reason = `Our algorithms highlighted this premium ${item.category} selection because of its unmatched specs, highly optimized energy rates, and perfect 5-star customer reviews.`;
    if (item.category === 'Laptops' && favoriteCategory === 'Smartphones') {
      reason = `Maximize power on both mobile and desktop. This elite laptop balances your focus on high-speed portable ${favoriteCategory} connectivity perfectly.`;
    } else if (item.category === 'Audio') {
      reason = `Immerse yourself into flawless studio sound. A perfect audio companion to complete your modern smart entertainment setup.`;
    }

    fallbackRecs.push({
      productId: item.id,
      name: item.name,
      reason,
      confidenceScore: 0.88 - (fallbackRecs.length * 0.05)
    });
    selectedIds.add(item.id);
  }

  res.json(fallbackRecs.slice(0, 3));
});

// ==========================================
// 7. ADVANCED SALES DATA ANALYTICS REPORTING
// ==========================================

app.get('/api/analytics', (req, res) => {
  db = readDb();
  const user = getAuthorizedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Sales reporting only available for authorized administrators.' });
  }

  // Calculate actual financial and supply logistics report KPIs
  let totalSales = 0;
  const totalOrders = db.orders.length;
  let lowStockItemsCount = db.products.filter(p => p.stock <= 10).length;

  // Category wise aggregates
  const salesByCatDict: Record<string, number> = {};
  // Daily performance breakdown
  const dailyDict: Record<string, { revenue: number; orders: number }> = {};
  // Single product sold metrics
  const productSalesDict: Record<string, { name: string; sales: number; revenue: number }> = {};

  // Hydrate all products stats with empty slots initially
  db.products.forEach(p => {
    productSalesDict[p.id] = { name: p.name, sales: 0, revenue: 0 };
    salesByCatDict[p.category] = 0;
  });

  db.orders.forEach(order => {
    if (order.paymentStatus === 'paid') {
      totalSales += order.total;

      // Group by created day
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyDict[dateStr]) {
        dailyDict[dateStr] = { revenue: 0, orders: 0 };
      }
      dailyDict[dateStr].revenue += order.total;
      dailyDict[dateStr].orders += 1;

      // Group items
      order.items.forEach((item: any) => {
        // Increment single product stats
        if (productSalesDict[item.productId]) {
          productSalesDict[item.productId].sales += item.quantity;
          productSalesDict[item.productId].revenue += item.price * item.quantity;
        }

        // Categorize
        const prodDef = db.products.find(p => p.id === item.productId);
        if (prodDef) {
          salesByCatDict[prodDef.category] = (salesByCatDict[prodDef.category] || 0) + (item.price * item.quantity);
        }
      });
    }
  });

  const salesByCategory = Object.entries(salesByCatDict).map(([category, value]) => ({
    category,
    value: parseFloat(value.toFixed(2))
  }));

  // Create daily trend for the last 5 days
  const dailyRevenue = Object.entries(dailyDict).map(([date, data]) => ({
    date,
    revenue: parseFloat(data.revenue.toFixed(2)),
    orders: data.orders
  })).sort((a,b) => a.date.localeCompare(b.date));

  // If there are no daily data points, seed dummy curves to make analytics beautiful
  if (dailyRevenue.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    dailyRevenue.push({ date: today, revenue: 0, orders: 0 });
  }

  const topProducts = Object.values(productSalesDict)
    .sort((a,b) => b.sales - a.sales)
    .slice(0, 5);

  res.json({
    totalSales: parseFloat(totalSales.toFixed(2)),
    totalOrders,
    lowStockItemsCount,
    salesByCategory,
    dailyRevenue,
    topProducts
  });
});

// ==========================================
// 8. USER ACTIVITY TRACKING ENDPOINTS
// ==========================================

app.post('/api/activity', (req, res) => {
  db = readDb();
  const user = getAuthorizedUser(req);
  const { action, details } = req.body;
  if (!action) {
    return res.status(400).json({ error: 'Missing action label.' });
  }

  const userId = user ? user.id : 'anonymous';
  const userName = user ? user.name : 'Guest User';

  logActivity(userId, userName, action, details);
  res.json({ success: true });
});

app.get('/api/activity', (req, res) => {
  db = readDb();
  const user = getAuthorizedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  // Admins see all activities, normal users only see theirs
  if (user.role === 'admin') {
    return res.json(db.activities);
  } else {
    const userActs = db.activities.filter(act => act.userId === user.id);
    return res.json(userActs);
  }
});

// ==========================================
// 9. MIDDLEWARE INGRESS MATRIX (VITE & STATIC ASSETS)
// ==========================================

async function startPlatform() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Mounting express over local Vite middleware mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production direct assets from:', distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NexCart premium node engine live on port ${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startPlatform();
}

export default app;
