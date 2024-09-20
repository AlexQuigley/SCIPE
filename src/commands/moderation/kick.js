const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
/**
 * 
 * @param {Client} client 
 * @param {Interaction} interaction 
 */
    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value || "No reason provided";

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(targetUserId);

        //Checks if user exsists in server
        if (!targetUser) {
            await interaction.editReply("That user doesn't exist in this server.");
            return;
        }

        //Checks if user is server owner
        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.editReply("You can't kick this user because they are the server owner.")
            return;
        }

        //Checks role permission higherarchy for proper authority
        //(Not allowed to ban someone with higher role permissions than you or the bot)
        const targetUserRolePosition = targetUser.roles.highest.position; //Highest role of the target user
        const requestUserRolePosition = interaction.member.roles.highest.position; //Highest role of the user running the command
        const botRolePosition = interaction.guild.members.me.roles.highest.position; //Highest role of the bot

        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.editReply("You can't kick that user because they have the same/higher role than you.");
            return;
        }

        if (targetUserRolePosition >= botRolePosition) {
            await interaction.editReply("I can't kick that user because they have the same or higher role than me.");
            return;
        }

        //Ban the targetUser
        try {
            await targetUser.kick({ reason });
            await interaction.editReply(`User ${targetUser} was kicked\nReason: ${reason}`);
        } catch (error) {
            console.log(`There was an error when banning: ${error}`)
        }
    },

    name: 'kick',
    description: 'Kicks a member from this server',
    options: [
        {
            name: 'target-user',
            description: 'The user you want to kick',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason you want to kick.',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.KickMembers],

}