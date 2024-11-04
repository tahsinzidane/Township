const express = require('express');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const Image = require('./models/Image');
const Notes = require('./models/notes');
const Partner = require('./models/partners');
const Reviews = require('./models/review');
require('dotenv').config();

const app = express();
const port = 3000;
const brandName = 'Township Online Seba';
const mobileNumber = "+880-1700962537";
const email = 'townshiponlineseba@gmail.com';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Set up the view engine and static folder
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Mock Admin setup with hashed password
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
let hashedPassword;

(async () => {
    hashedPassword = await bcrypt.hash(adminPassword, 10);
})();

const Admin = {
    findOne: async ({ username }) => {
        if (username === adminUsername) {
            return { username, password: hashedPassword };
        }
        return null;
    }
};

// Middleware to protect admin routes
const isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/admin/login');
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Homepage route
app.get('/', async (req, res, next) => {
    try {
        const images = await Image.find();
        const notes = await Notes.find();
        const partners = await Partner.find();
        const reviews = await Reviews.find();
        res.render('index', { brandName, mobileNumber, email, images, notes, partners, reviews });
    } catch (error) {
        next(error);
    }
});

// Render login page
app.get('/admin/login', (req, res) => {
    res.render('login', { brandName, error: null });
});

app.post('/admin/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (admin && await bcrypt.compare(password, admin.password)) {
            req.session.isAuthenticated = true;
            return res.redirect('/admin');
        } else {
            return res.render('login', { brandName, error: 'Invalid username or password.' });
        }
    } catch (error) {
        next(error);
    }
});

// Admin panel routes
app.get('/admin', isAuthenticated, (req, res) => {
    res.render('admin', { brandName });
});

// Update header route
app.get('/admin/update-header', isAuthenticated, async (req, res, next) => {
    try {
        const images = await Image.find();
        res.render('upload-img', { brandName, images });
    } catch (error) {
        next(error);
    }
});

// Route to handle image uploads
app.post('/upload-images', isAuthenticated, upload.array('images', 5), async (req, res, next) => {
    try {
        const uploadedImages = req.files.map(file => ({
            path: '/uploads/' + file.filename
        }));
        await Image.insertMany(uploadedImages);
        res.redirect('/admin');
    } catch (error) {
        next(error);
    }
});

// Delete image route
app.post('/delete-image', isAuthenticated, async (req, res, next) => {
    try {
        const { imagePath } = req.body;
        const image = await Image.findOneAndDelete({ path: imagePath });

        if (image) {
            fs.unlinkSync(path.join(__dirname, image.path));
        }
        res.redirect('/admin');
    } catch (error) {
        next(error);
    }
});

// Routes for notes
app.get('/admin/new-notes', isAuthenticated, async (req, res, next) => {
    try {
        const allNotes = await Notes.find();
        res.render('newNotes', { brandName, notes: allNotes });
    } catch (error) {
        next(error);
    }
});

app.post('/admin/new-notes', isAuthenticated, async (req, res, next) => {
    try {
        const newNote = new Notes({
            content: req.body.Notes,
            description: req.body.description
        });
        await newNote.save();
        res.redirect('/admin/new-notes');
    } catch (error) {
        next(error);
    }
});

app.post('/admin/delete-note', isAuthenticated, async (req, res, next) => {
    try {
        await Notes.findByIdAndDelete(req.body.noteId);
        res.redirect('/admin/new-notes');
    } catch (error) {
        next(error);
    }
});

app.post('/admin/delete-description', isAuthenticated, async (req, res, next) => {
    try {
        await Notes.findByIdAndUpdate(req.body.noteId, { description: "" });
        res.redirect('/admin/new-notes');
    } catch (error) {
        next(error);
    }
});

// Partner routes
app.get('/admin/add-partner', isAuthenticated, async (req, res, next) => {
    try {
        const partners = await Partner.find();
        res.render('add-partner', { brandName, partners });
    } catch (error) {
        next(error);
    }
});

app.post('/admin/add-partner', isAuthenticated, upload.single('file'), async (req, res, next) => {
    try {
        const addedPartner = new Partner({
            path: '/uploads/' + req.file.filename
        });
        await addedPartner.save();
        res.redirect('/admin/add-partner');
    } catch (error) {
        next(error);
    }
});

app.post('/admin/delete-partner', isAuthenticated, async (req, res, next) => {
    try {
        const { partnerId } = req.body;
        const partner = await Partner.findByIdAndDelete(partnerId);

        if (partner) {
            fs.unlinkSync(path.join(__dirname, partner.path));
        }
        res.redirect('/admin/add-partner');
    } catch (error) {
        next(error);
    }
});

// Review routes
app.get('/admin/review', isAuthenticated, async (req, res, next) => {
    try {
        const reviews = await Reviews.find();
        res.render('review', { brandName, reviews });
    } catch (error) {
        next(error);
    }
});

app.post('/admin/review', isAuthenticated, async (req, res, next) => {
    try {
        const userReview = new Reviews({
            name: req.body.name,
            email: req.body.email,
            comment: req.body.comment
        });
        await userReview.save();
        res.redirect('/');
    } catch (error) {
        next(error);
    }
});

app.post('/admin/delete-review', isAuthenticated, async (req, res, next) => {
    try {
        const { reviewId } = req.body;
        await Reviews.findByIdAndDelete(reviewId);
        res.redirect('/admin/review');
    } catch (error) {
        next(error);
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/admin/login');
    });
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).send('Something went wrong. Please try again later.');
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
