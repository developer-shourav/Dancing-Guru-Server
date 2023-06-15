const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000 ;

const app = express();




// Middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.evuna6q.mongodb.net/?retryWrites=true&w=majority`;

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
      // Connect the client to the server	(optional starting in v4.7)
      /* await client.connect(); */

      const classCollection = client.db('danceDB').collection('allClass');
      const usersCollection = client.db('danceDB').collection('users');
      const selectedClassCollection = client.db('danceDB').collection('selectedClass');
       


      /* ---------------Create An User------------- */
      app.post('/users', async(req, res)  => {
          
        const user = req.body;
        const query = {userEmail : user.userEmail};
        const existingUser = await usersCollection.findOne(query);
        if(existingUser){
            res.send({message:'User Already exist.'})
        }
        else{
            const result = await usersCollection.insertOne(user);
            res.send(result)
        }
     });

      /* ---------------Add A Selected Class------------- */
      app.post('/selectedCls', async(req, res)  => {
          
        const selectedClass = req.body;
        const result = await selectedClassCollection.insertOne(selectedClass);
        res.send(result)
     });

      /* ---------------Get User all Selected Class------------- */
      app.get('/selectedCls/:email', async(req, res)  => {

        const email = req.params.email;
        const query = {studentEmail: email};
        const result = await selectedClassCollection.find(query).toArray();
        res.send(result)
     });


     /* ---------------Find An User using Email------------- */
        app.get('/users/:email',  async(req, res) => {
          const email = req.params.email;
          if(email === 'abc@gmail.com'){
            res.send({message:'User not exist.'})
          }

          else{
            const query = {userEmail: email};
            const result = await usersCollection.findOne(query);
            res.send(result)
          }

      })
      

      /* ------ All Classes ------- */
      app.get('/classes', async(req, res) => {

        const classes = classCollection.find();
        const result =  await classes.toArray();
        res.send(result)
      });

      /* ------ All Instructors ------- */
      app.get('/instructors', async(req, res) => {
        
        const userRole = 'instructor';
        const query = {role: userRole};
        const instructors = usersCollection.find(query);
        const result =  await instructors.toArray();
        res.send(result)
      });


      /* ------Popular Classes Based on Total Students---------- */
      app.get('/popularCls', async(req, res) => {
        const query = {};
        const options = {
           sort:{"totalStudents" : -1}
        }
        const limit = 6;
        const popularClasses = classCollection.find(query, options).limit(limit);
        const result =  await popularClasses.toArray();
        res.send(result)
      });

    /* ------Popular Instructors Based on Total Students---------- */
    app.get('/popularInstructor', async(req, res) => {
        const query = {};
        const options = {
        sort:{"totalStudents" : -1}
        }
        const limit = 6;
        const popularInstructor = classCollection.find(query, options).limit(limit);
        const result =  await popularInstructor.toArray();
        res.send(result)
    });

 /* ------------------Delete a Selected unpaid Class  ----------- */
      app.delete('/selectedCls/:id', async(req, res) => {
        const iD = req.params.id;
        const query = {_id: new ObjectId(iD)};
        const result = await selectedClassCollection.deleteOne(query);
        res.send(result)
      })
     

     
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      /* await client.close(); */
    }
  }
  run().catch(console.dir);
  


app.get('/' , (req, res) => {
    res.send('Welcome to Dancing Guru')
})
app.get('/about' , (req, res) => {
    res.send('Learn About Us')
})



app.listen(port , () => {
    console.log(`Our Dancing Guru is running On the PORT:${port}`);
})

