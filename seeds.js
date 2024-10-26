const mongoose = require("mongoose");
const Product = require("./models/products");
import 'dotenv/config'

mongoose.connect(`mongodb+srv://mohitkumarr60:${process.env.DB_PASSWORD}@test.kcirr.mongodb.net/?retryWrites=true&w=majority&appName=test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database connected");
}).catch(err => {
    console.log("Database connection error", err);
});

const seedProducts = [
    {
        name: "Pepper Spray",
        price: 250,
        description: "A handy pepper spray for personal safety.",
        image: "pepper_spray.jpg"
    },
    {
        name: "Safety Keychain",
        price: 150,
        description: "Multi-purpose keychain with safety tools.",
        image: "keychain.jpg"
    },
    {
        name: "Personal Alarm",
        price: 300,
        description: "A loud personal alarm to alert others in emergencies.",
        image: "alarm.jpg"
    }
];

Product.insertMany(seedProducts)
    .then(() => {
        console.log("Products added successfully!");
        mongoose.connection.close();
    })
    .catch(err => {
        console.log("Error adding products", err);
    });
