import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

let usersDB = {
    users: [],
    setUsers: function (data) { this.users = data; }
};

const loadUsersDB = async () => {
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.join(__dirname, '..', 'model', 'users.json');
        console.log(`Loading users database from: ${filePath}`);
        
        // Read the file content
        const data = await fsPromises.readFile(filePath, 'utf-8');
        
        // Parse the data and set users
        usersDB.setUsers(JSON.parse(data));
    } catch (err) {
        console.error(`Failed to load users database: ${err}`);
    }
};

loadUsersDB();


const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) return res.sendStatus(403); // Forbidden

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": decoded.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );
        res.json({ accessToken });
    });
};

export default { handleRefreshToken };
