import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';



let usersDB = {
    users: [],
    setUsers: function (data) { this.users = data; }
};

const loadUsersDB = async () => {
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.join(__dirname, '..', 'model', 'users.json');
    
    // Log the filePath to the console
    console.log(`Loading users database from: ${filePath}`);
        const data = await fsPromises.readFile(filePath, 'utf-8');
        usersDB.setUsers(JSON.parse(data)); // Set the users after loading.
    } catch (err) {
        console.error(`Failed to load users database: ${err}`);
    }
};

loadUsersDB();
const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    const otherUsers = usersDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);
    const currentUser = { ...foundUser, refreshToken: '' };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(usersDB.users)
    );

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
}

export default {handleLogout};