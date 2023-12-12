const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://assign11-career-hunt.web.app'],
    credentials: true,
  }),
)
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tl5czkc.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const jobCollection = client.db('careerHunter').collection('jobsByCategory');
    const appliedJobCollection = client.db('careerHunter').collection('appliedJobs');

    // to get all the jobs
    app.get('/jobs', async (req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result);
    })
    // to get a specific job
    app.get('/jobdetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobCollection.findOne(query);
      res.send(result);
    })
    // to get specific user's jobs from collection by filter
    app.get('/jobs/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    })
    // to add a car job jobCollection
    app.post('/jobs', async (req, res) => {
      const newJob = req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    })
    // to update a job
    app.put('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedJob = req.body;

      const job = {
        $set: {
          category: updatedJob.category,
          postedBy: updatedJob.postedBy,
          email: updatedJob.email,
          employer: updatedJob.employer,
          jobTitle: updatedJob.jobTitle,
          postingDate: updatedJob.postingDate,
          deadline: updatedJob.deadline,
          salaryRange: updatedJob.salaryRange,
          applicantsNumber: updatedJob.applicantsNumber,
          companyLogo: updatedJob.companyLogo,
          jobBanner: updatedJob.jobBanner,
          description: updatedJob.description
        }
      }

      const result = await jobCollection.updateOne(filter, job, options);
      res.send(result);
    })
    // to increase the number of applicants when anyone applies
    app.post('/updatejobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.updateOne(query, { $inc: { applicantsNumber: 1 } });
      res.send(result);
    })
    // to delete a job from collection 
    app.delete('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })





    // to get specific user's applied jobs from collection by filter
    app.get('/appliedjobs/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await appliedJobCollection.find(query).toArray();
      res.send(result);
    })
    // to add a user in appliedJobCollection
    app.post('/appliedjobs', async (req, res) => {
      const newAppliedUser = req.body;
      const result = await appliedJobCollection.insertOne(newAppliedUser);
      res.send(result);
    })


  } finally {
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Career Hunt server is running')
})

app.listen(port, () => {
  console.log(`Career Hunt server is running on port: ${port}`)
})