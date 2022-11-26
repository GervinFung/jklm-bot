import readLine from 'readline';

const getName = ({
    io,
}: Readonly<{
    io: ReturnType<typeof readLine.createInterface>;
}>) =>
    new Promise<string>((resolve) => {
        io.question('What is the name of the bot: ', (name) => {
            if (name.length >= 3) {
                resolve(name);
            } else {
                console.error('Name must have at least 3 characters');
                getName({
                    io,
                }).then(resolve);
            }
        });
    });

const getPort = ({
    io,
}: Readonly<{
    io: ReturnType<typeof readLine.createInterface>;
}>) =>
    new Promise<string>((resolve) => {
        io.question('What is the game port: ', (port) => {
            if (port.match(/[A-Z]{4}/)) {
                resolve(port);
            } else {
                console.error(
                    'Port must have 4 uppercase alphabetical characters'
                );
                getPort({ io }).then(resolve);
            }
        });
    });

const promptInput = async () => {
    const io = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const port = await getPort({ io });
    const name = await getName({ io });

    io.close();

    return {
        port,
        name,
    };
};

export default promptInput;
