const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const Contact = require("./models/contact");
const Product = require("./models/products");
const { ethers } = require("ethers");

const app = express();

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/womenSafetyApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// Middleware setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session setup for cart management
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize cart in session if it doesn't exist
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  res.locals.cartCount = req.session.cart.length;
  next();
});

// Routes

// Home Page
app.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.render("index", { products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Safety Page
app.get("/safety", (req, res) => {
  res.render("safety");
});

// Google Maps Page
app.get("/map", (req, res) => {
  res.render("map", { googleMapsAPIKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE" });
});

// Contact Routes
app.route("/contacts")
  .get(async (req, res) => {
    try {
      const contacts = await Contact.find({});
      res.render("contacts/index", { contacts });
    } catch (err) {
      console.error("Error fetching contacts:", err);
      res.status(500).send("Internal Server Error");
    }
  })
  .post(async (req, res) => {
    const { name, phone, email } = req.body;
    const newContact = new Contact({ name, phone, email });
    await newContact.save();
    res.redirect("/contacts");
  });

app.get("/contacts/new", (req, res) => res.render("contacts/new"));

app.route("/contacts/:id")
  .get(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    res.render("contacts/show", { contact });
  })
  .put(async (req, res) => {
    await Contact.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/contacts/${req.params.id}`);
  })
  .delete(async (req, res) => {
    await Contact.findByIdAndDelete(req.params.id);
    res.redirect("/contacts");
  });

app.get("/contacts/:id/edit", async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  res.render("contacts/edit", { contact });
});

app.get('/signin', (req, res) => {
  res.render('signin'); // Render the signin.ejs page
});

// Product Routes
app.route("/products")
  .get(async (req, res) => {
    try {
      const products = await Product.find({});
      res.render("products/index", { products });
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).send("Internal Server Error");
    }
  })
  .post(async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect("/products");
  });



  async function payWithPolygon() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const tx = await signer.sendTransaction({
      to: '0xRecipientAddress',  // Replace with actual recipient address
      value: ethers.utils.parseEther('0.01')  // Example amount
    });
    console.log('Transaction sent:', tx.hash);
  } else {
    alert('Please install MetaMask!');
  }
}



// Connect to MetaMask
async function connectWallet() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Wallet connected!");
            alert("Wallet connected!");
        } catch (error) {
            console.error("Wallet connection failed:", error);
            alert("Wallet connection failed:", error);
        }
    } else {
        alert("MetaMask is not installed. Please install it to proceed.");
    }
}

// Switch to the Polygon network
async function switchToPolygon() {
    const polygonChainId = '0x89'; // Hex for 137
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: polygonChainId }],
        });
        console.log("Switched to Polygon network!");
        alert("Switched to Polygon network!");
    } catch (switchError) {
        if (switchError.code === 4902) {
            console.error("Polygon network not found in MetaMask. Please add it.");
            alert("Polygon network not found in MetaMask. Please add it.");
        }
    }
}

// Server Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
