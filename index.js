const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const app = express();




app.use(express.json())

app.set('view engine', 'ejs');

// "/users"  -> returns users data from file
// "/create" -> creates a new user in file
// "/update/:name" -> updates user data in file specified by name

/* data Format
 data={
     name,
     age,
     email
 }
     */





app.get('/users', async (req, res) => {

    fs.readFile('userData.txt', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ error: 'Error reading data.' });
        } else {
            data = data.toString();
            const entries = data.trim().split('\n');
            const fileData = entries.map((entry) => JSON.parse(entry));
            res.status(200).json(fileData);
        }
    });
})

app.post('/create', (req, res) => {
    try {
        const user = {
            ...req.body,
        }
        if (!user.name || !user.age || !user.email) {
            throw 'Please enter name, age and email to create user'
        }
        console.log(user, "user");
        fs.appendFile('userData.txt', JSON.stringify(user) + '\n', function (err) {
            if (err) {
                res.status(500).json({ error: 'Error writing data.' });
                return;
            };
        });
        res.status(201).send(user);
    }
    catch (err) {
        console.log(err)
        res.status(400).json({ err })
    }
})

app.get('/', async (req, res) => {
    fs.readFile('userData.txt', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ error: 'Error reading data.' });
        } else {
            data = data.toString();
            const entries = data.trim().split('\n');
            const users = entries.map((entry) => JSON.parse(entry));
            res.render('users', { users });
        }
    });
});

//enter name in params
// enter age and email in body to change
app.put('/update/:name', (req, res) => {
    try {
        const name = req.params.name;
        const { age, email } = req.body;
        if (!age || !email || !name) {
            throw 'Please enter name, age and email to update user'
        }
        fs.readFile('userdata.txt', (err, data) => {
            if (err) {
                res.status(500).json({ error: 'Error reading data.' });
                return;
            } else {
                data = data.toString();
                const entries = data.trim().split('\n');
                const fileJsonData = entries.map((entry) => JSON.parse(entry));
                const findIndex = fileJsonData.findIndex((data) => data.name == name);
                if (findIndex === -1) {
                    res.status(500).send({ message: 'User not found.' })
                    return;
                }
                const updatedData = fileJsonData.map((entry) => {
                    if (entry.name == name) {
                        return { ...entry, age: age, email: email }
                    }
                    return entry
                })
                const updatedStringData = updatedData.map((entry) => JSON.stringify(entry) + '\n').join('');
                fs.writeFile('userdata.txt', updatedStringData, (err) => {
                    if (err) {
                        res.status(500).json({ message: 'Error updating data.' });
                        return;
                    } else {
                        res.status(200).json({ message: 'Data updated.' });
                    }
                });
            }
        });
    }
    catch (err) {
        console.log(err)
        res.status(400).json({ err })
    }
})

app.listen(3000, () => {
    console.log('Server running on port 3000');
})