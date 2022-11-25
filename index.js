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
		return ''
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
		res.send(car)
		client.close();
	});
})


// Delete specified car
app.delete('/cars/:id',  (req, res) => { 
	
})


// Edit specified car
app.put('/cars/:id',  (req, res) => { 

})


// Add new car
app.post('/cars',  (req, res) => { 

})


app.listen(3000);