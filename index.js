const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    ChannelType
} = require('discord.js');

const {
    joinVoiceChannel,
    getVoiceConnection
} = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

client.once('ready', async () => {

    console.log(`${client.user.tag} ONLINE`);

    // COMANDO /call
    const commands = [
        new SlashCommandBuilder()
            .setName('call')
            .setDescription('Faz o bot entrar em uma call')
            .addChannelOption(option =>
                option
                    .setName('canal')
                    .setDescription('Selecione a call')
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName('leave')
            .setDescription('Faz o bot sair da call')
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );

        console.log('Slash commands registrados.');

    } catch (err) {
        console.log(err);
    }
});

client.on('interactionCreate', async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    // /call
    if (interaction.commandName === 'call') {

        const canal = interaction.options.getChannel('canal');

        try {

            joinVoiceChannel({
                channelId: canal.id,
                guildId: canal.guild.id,
                adapterCreator: canal.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });

            await interaction.reply({
                content: `Entrei na call: ${canal.name}`,
                ephemeral: true
            });

        } catch (err) {

            console.log(err);

            await interaction.reply({
                content: 'Erro ao entrar na call.',
                ephemeral: true
            });
        }
    }

    // /leave
    if (interaction.commandName === 'leave') {

        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({
                content: 'Nao estou em call.',
                ephemeral: true
            });
        }

        connection.destroy();

        interaction.reply({
            content: 'Sai da call.',
            ephemeral: true
        });
    }
});

client.login(TOKEN);
