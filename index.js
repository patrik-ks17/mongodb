const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;
const bodyParser = require('body-parser');


function getClient() {
	const { MongoClient, ServerApiVersion } = require("mongodb");
	const uri ="mongodb+srv://testUser2:kuP0HsONJY4tD2Pb@cluster0.gev7m7p.mongodb.net/?retryWrites=true&w=majority";
	return new MongoClient(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverApi: ServerApiVersion.v1,
	});
}

function getId(raw) {
	try {
		return new ObjectId(raw);
	} catch (error) { 
		return '';
	}
}



// Get all cars
app.get('/cars', (req, res) => { 
	const client = getClient();

	client.connect(async err => {
		const collection = client.db("taxi_app").collection("cars");
		const cars = await collection.find().toArray();
		res.send(cars)
		client.close();
	});
})


// Get car by ID
app.get('/cars/:id',  (req, res) => { 
	const id = getId(req.params.id);
	if (!id) {
		res.send({error: 'Invalid id'});
		return;
	}
	const client = getClient();
	client.connect(async err => {
		const collection = client.db("taxi_app").collection("cars");
		const car = await collection.findOne({_id: id});
		if (!car) {
			res.send({error: 'Not found'});
			return;
		}
		res.send(car);
		client.close();
	});
})


// Delete specified car
app.delete('/cars/:id',  (req, res) => { 
	const id = getId(req.params.id);
	if (!id) {
		res.send({error: 'Invalid id'});
		return;
	}
	const client = getClient();
	client.connect(async err => {
		const collection = client.db("taxi_app").collection("cars");
		const result = await collection.deleteOne({_id: id});
		if (!result.deletedCount) {
			res.send({error: 'Not found'});
			return;
		}
		res.send({id: id});
		client.close();
	});
})


// Edit specified car
app.put('/cars/:id', bodyParser.json(), (req, res) => { 
	const updatedCar = {
		name: req.body.name,
		licenseNumber: req.body.licenseNumber,
		hourlyRate: req.body.hourlyRate,
	};

	const id = getId(req.params.id);
	if (!id) {
		res.send({error: 'Invalid id'});
		return;
	}
	const client = getClient();
	client.connect(async err => {
		const collection = client.db("taxi_app").collection("cars");
		const result = await collection.findOneAndUpdate({_id: id}, {$set: updatedCar}, {returnDocument: "after"});
		console.log(result.value);
		if (!result.ok) {
			res.send({error: 'Not found'});
			return;
		}
		res.send(result.value);
		client.close();
	});
})


// Add new car
app.post('/cars', bodyParser.json(), (req, res) => { 
	const newCar = {
		name: req.body.name,
		licenseNumber: req.body.licenseNumber,
		hourlyRate: req.body.hourlyRate,
		trips: []
	};

	const client = getClient();
	client.connect(async err => {
		const collection = client.db("taxi_app").collection("cars");
		const result = await collection.insertOne(newCar);
		if (!result.insertedId) {
			res.send({error: 'Insert error'});
			return;
		}
		res.send(newCar);
		client.close();
	});
})

app.post('/trips', bodyParser.json(), (req, res) => {  
	
});


app.listen(3000);