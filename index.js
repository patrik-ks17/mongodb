const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;


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


const bodyParser = require('body-parser');

// Edit specified car
app.put('/cars/:id', bodyParser.json(), (req, res) => { 
	const updatedCar = {
		name: body.name,
		licenseNumber: body.licenseNumber,
		hourlyRate: body.hourlyRate,
	};

	const id = getId(req.params.id);
	if (!id) {
		res.send({error: 'Invalid id'});
		return;
	}
	const client = getClient();
	client.connect(async err => {
		const collection = client.db("taxi_app").collection("cars");
		const result = await collection.updateOne({_id: id}, {$set: updatedCar});
		if (!result.modifiedCount) {
			res.send({error: 'Not found'});
			return;
		}
		res.send(updatedCar);
		client.close();
	});
	
})


// Add new car
app.post('/cars', bodyParser.json(), (req, res) => { 
	const newCar = {
		name: body.name,
		licenseNumber: body.licenseNumber,
		hourlyRate: body.hourlyRate,
		trips: []
	};

	const client = getClient();
	client.connect(async err => {
		const collection = client.db("taxi_app").collection("cars");
		const result = await collection.insertOne(newCar);
		if (!result.insertedCount) {
			res.send({error: 'Insert error'});
			return;
		}
		res.send(newCar);
		client.close();
	});
})


app.listen(3000);