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


const path = require('path');

app.use(express.static('public'))

app.get('/', (req, res) => { 
	res.sendFile(path.join(__dirname, 'views', 'home.html'))
})


// Get all cars
app.get('/cars', (req, res) => { 
	const client = getClient();

	client.connect(async err => {
		const collection = client.db("taxi_app").collection("cars");
		// const cars = await collection.find({hourlyRate: {$eq: 'ABC-123'}}).toArray();
		// const cars = await collection.find({hourlyRate: {$gt: 1000}, hourlyRate: {$lt: 4000}}).toArray();
		//const cars = await collection.find({name: {$in: ['Audi RS']}}).toArray();
		const cars = await collection.find(req.query.params)
		.limit(1)
		.skip(0)
		.sort({hourlyRate: 1})
		.toArray()
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
	const newTrip = {
		numberOfMinutes: req.body.numberOfMinutes,
		date: Math.floor(Date.now() / 1000)
	};

	const id = getId(req.body.carId);
	if (!id) {
		res.send({error: 'Invalid id'});
		return;
	}
	const client = getClient();
	client.connect(async err => {
		const collection = client.db("taxi_app").collection("cars");
		const result = await collection.findOneAndUpdate(
			{_id: id},
			{$push: {trips: newTrip}},
			{returnDocument: "after"}
		);
		if (!result.ok) {
			res.send({error: 'Not found'});
			return;
		}
		res.send(result.value);
		client.close();
	});
});


app.listen(3000);