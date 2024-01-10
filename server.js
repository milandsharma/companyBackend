import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Connect to MongoDB
mongoose.connect("mongodb+srv://milandsharma:Sasni123@cluster0.iypepdn.mongodb.net/companyDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Define MongoDB schema and model
const clientSchema = mongoose.Schema({
  districtName: String,
  User: [
    {
      name: String,
      address: String,
      phone: [Number],
    },
  ],
});

const Data = mongoose.model('Data', clientSchema);

// Endpoint to fetch all data
app.get("/", (req, res) => {
  Data.find({}).then((data) => {
    res.json(data);
  }).catch((error) => {
    console.error("Error fetching data", error);
    res.status(500).json({ error: "Internal Server Error" });
  });
});

// Dummy endpoint for testing
app.get("/data", (req, res) => {
  res.json({ data: "hello" });
});

// Endpoint to handle data creation or update
app.post("/data", async (req, res) => {
  try {
    const { data } = req.body;

    // Check if data with the given districtName exists
    const existingData = await Data.findOne({ districtName: data.district });

    if (existingData) {
      // Update existing data
      await Data.updateOne({ districtName: data.district }, {
        $push: {
          User: {
            name: data.name,
            address: data.address,
            phone: [data.phoneNumber],
          },
        },
      });
      console.log("Data updated");
    } else {
      // Insert new data
      await Data.create({
        districtName: data.district,
        User: [
          {
            name: data.name,
            address: data.address,
            phone: [data.phoneNumber],
          },
        ],
      });
      console.log("New data created");
    }

    res.send({ success: true });
  } catch (error) {
    console.error("Error handling data", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to validate password
app.post("/validatePassword", (req, res) => {
  const { password } = req.body;
  // Example: You can implement your own password validation logic here
  const isValid = password === "22";
  res.json({ isValid });
});

// Endpoint to delete data based on selected user's name
app.post("/deleteData", async (req, res) => {
  try {
    const { clientName, password } = req.body;

    // Example: Validate password
    const isValid = password == "22";
    if (!isValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Example: Delete data based on selected user's name
    await Data.updateOne(
      { "User.name": clientName },
      { $pull: { User: { name: clientName } } }
    );

    console.log(`Data for user ${clientName} deleted`);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting data", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ... (previous code)

// Endpoint to update data based on clientName
app.put("/updateData/:clientName", async (req, res) => {
    try {
      const { clientName } = req.params;
      const { newData, password } = req.body;
  
      // Example: Validate password
      const isValid = password === "22";
      if (!isValid) {
        return res.status(401).json({ error: "Invalid password" });
      }
  
      // Example: Update data based on selected user's name
      await Data.updateOne(
        { "User.name": clientName },
        { $set: { "User.$": newData } }
      );
  
      console.log(`Data for user ${clientName} updated`);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error updating data", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // ... (remaining code)
  

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
