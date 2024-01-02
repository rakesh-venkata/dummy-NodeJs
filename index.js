
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { uploadFile } = require('./s3.js');



const app = express();
const port = 3000


mongoose.connect("mongodb+srv://19131a04d1:v7IeFiv28kUGDsoC@cluster0.trhnljw.mongodb.net/travelapp");

app.use(bodyParser.json());
app.use(cors());

const upload = multer({ dest: 'Image' });




const userSchema = new mongoose.Schema({
    userName: String,
    userId : Number,
    password: String
});

const postSchema = new mongoose.Schema({
    country: String,
    state: String,
    place: String,
    experience: String,
    date: Date,
    files: [String]
})

const user = mongoose.model('Users', userSchema);
const post = mongoose.model('Posts', postSchema);


var postCount = 0;

app.post('/signup', (req, res) => {
    console.log(req.body);
    const { userName, password } = req.body;

    const newUser = new user({ userName, password });
    newUser.save();
    res.json({ userName, password });

})

app.post('/login', (req, res) => {
    const { userName, password } = req.body;
    const exists = user.findOne({ userName });
    if (exists) {
        res.json({ exist: true });
    } else {
        res.json({ exist: false });
    }
});


app.post('/add', upload.any(), (req, res) => {
    try {
        postCount += 1;
        const fileKeys = [];
        for (var number = 0; number < req.files.length; number++) {
            const key = uploadFile(req.files[number].path, number, postCount);
            fileKeys.push(key);
        }

        const newPost = new post({ country: req.body.country, state: req.body.state, place: req.body.place, experience: req.body.experience, date: req.body.date, files: fileKeys });
        newPost.save();
        res.send("Succesfully added");
    }
    catch (err) {
        console.log(err);
        res.send("Error while adding");
    }


})

async function fetchData(req, res) {
    var documents = [];
    const cursor = await post.find(); // returns a cursor object
    const feed = await cursor.forEach((doc) => {
       
        documents.push(doc);
    })
    res.json({ documents });
}

app.get('/feed', fetchData);

app.get('/getuser', async (req,res) => {
    var users = [];
    const cursor = await user.find();
    cursor.forEach((user) => {
        users.push(user);
    })

    var users = users.map((user) => user);
    res.json({ users });
});

app.post('/adduser', async (req, res) => {
    
    const newUser = new user({ userName: req.body.user, userId : req.body.userId });
    await newUser.save();
    res.json({ added: true });

});

app.post('/deleteuser', async (req, res) => {
    
    const result = await user.deleteOne({ userId: req.body.userId });
    console.log(result);
    if (result) {
        res.json({ deleted: true });
    }
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})