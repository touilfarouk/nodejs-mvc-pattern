import bcrypt from 'bcrypt';
import { promises as fsPromises } from 'fs';
import path from 'path';
import users from '../model/users.json' assert { type: 'json' };

const usersDB = {
    users: users,
    setUsers: function (data) { this.users = data; }
};

const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    const duplicate = usersDB.users.find(person => person.username === user);
    if (duplicate) return res.sendStatus(409); // Conflict
    try {
        const hashedPwd = await bcrypt.hash(pwd, 10);
        const newUser = {
            "username": user,
            "roles": { "User": 2001 },
            "password": hashedPwd
        };
        usersDB.setUsers([...usersDB.users, newUser]);
        await fsPromises.writeFile(
            path.join(path.dirname(''), '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );
        console.log(usersDB.users);
        res.status(201).json({ 'success': `New user ${user} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

export default { handleNewUser };
