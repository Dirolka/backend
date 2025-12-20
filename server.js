const express = require('express')
let app = express()
const fs = require('fs');
const path = './data.json';

app.use(express.json());

app.get('/', (req, res) => {
    console.log(`Request url: ${req.url}`)
    res.send('<h1>main menu</h1>')
})

app.get('/info', (req, res) => {
    console.log(`Request url: ${req.url}`)
    res.send('<h1>Info</h1>')
})
app.get('/hello', (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get('/time', (req, res) => {
    res.json({ time: new Date().toLocaleString() });
});

app.get('/status', (req, res) => {
    res.status(200).json({ status: "OK" });
});




const readData = () => {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
};


const writeData = (data) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
};


app.get('/objects', (req, res) => {
    const data = readData();
    res.json(data.objects);
});

app.post('/objects', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const data = readData();
    const newObject = { id: Date.now(), name }; // Авто-инкремент ID
    data.objects.push(newObject);

    writeData(data);
    res.status(201).json(newObject);
});


app.put('/objects/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const data = readData();
    const objectIndex = data.objects.findIndex(obj => obj.id == id);
    if (objectIndex === -1) return res.status(404).json({ error: "Object not found" });

    data.objects[objectIndex].name = name;
    writeData(data);
    res.json(data.objects[objectIndex]);
});


app.delete('/objects/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const objectIndex = data.objects.findIndex(obj => obj.id == id);
    if (objectIndex === -1) return res.status(404).json({ error: "Object not found" });

    data.objects.splice(objectIndex, 1);
    writeData(data);
    res.json({ success: true });
});
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})