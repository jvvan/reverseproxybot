import "dotenv/config";
import { Client, ColorResolvable, MessageEmbed, Util } from "discord.js";
import { commands } from "./commands";
import axios from "axios";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
const PROXY_URL = process.env.PROXY_URL!;
const PROXY_AUTH = process.env.PROXY_AUTH!;
const USERS = process.env.USERS!.split(",");
const EMBED_COLOR = (process.env.EMBED_COLOR ?? "BLUE") as ColorResolvable;

const client = new Client({
  intents: ["GUILDS"],
});

const proxy = axios.create({
  baseURL: PROXY_URL,
  headers: {
    Authorization: PROXY_AUTH,
    "Content-Type": "application/json",
  },
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user!.tag}!`);
  if (process.argv.includes("--register")) {
    const cmds = await client.application!.commands.set(
      commands.map((r) => r.toJSON())
    );
    console.log(`Registered ${cmds.size} commands`);
  }
});

client.on("interactionCreate", async (interaction): Promise<any> => {
  if (!interaction.isCommand()) return;
  if (!USERS.includes(interaction.user.id)) {
    return interaction.reply({
      embeds: [
        createEmbed("Proxy", "You are not allowed to use this command."),
      ],
    });
  }

  if (interaction.commandName === "proxy") {
    const domain = interaction.options.getString("domain");
    const target = interaction.options.getString("target");
    const ssl = interaction.options.getBoolean("ssl", false) ?? true;

    await interaction.reply({
      embeds: [
        createEmbed(
          "Please wait...",
          "Creating a proxy can take up to 30 seconds."
        ),
      ],
    });
    const response = await proxy
      .post<{
        message?: string;
        error?: string;
        statusCode: number;
      }>(`/proxies`, {
        domain,
        target,
        ssl,
      })
      .then((r) => r.data)
      .catch(console.error);
    if (!response)
      return interaction.editReply({
        embeds: [createEmbed("Proxy", "Something went wrong.")],
      });

    if (response?.statusCode !== 200) {
      return interaction
        .editReply({
          embeds: [
            createEmbed(
              "Error while creating a proxy",
              response?.error ?? response?.message ?? "Unknown error"
            ),
          ],
        })
        .catch(() => {});
    }
    return interaction
      .editReply({
        embeds: [createEmbed("Proxy created", "Successfully created a proxy")],
      })
      .catch(() => {});
  } else if (interaction.commandName === "proxydelete") {
    const domain = interaction.options.getString("domain");
    const keepCertificate =
      interaction.options.getBoolean("keep_certificate", false) ?? false;

    await interaction.reply({
      embeds: [
        createEmbed(
          "Please wait...",
          "Deleting a proxy can take up to 30 seconds."
        ),
      ],
    });

    const response = await proxy
      .delete<{
        error?: string;
        message?: string;
        statusCode: number;
      }>(`/proxies/${domain}?keepCertificate=${keepCertificate}`)
      .then((r) => r.data)
      .catch(console.error);

    if (response?.statusCode !== 200) {
      return interaction.editReply({
        embeds: [
          createEmbed(
            "Error while deleting a proxy",
            response?.error ?? response?.message ?? "Unknown error"
          ),
        ],
      });
    }

    return interaction.editReply({
      embeds: [createEmbed("Proxy deleted", "Successfully deleted a proxy")],
    });
  } else if (interaction.commandName === "proxylist") {
    const response = await proxy
      .get<IMetadata[]>(`/proxies`)
      .then((res) => res.data);

    if (!response.length) {
      return interaction.reply({
        embeds: [createEmbed("Proxy List", "No proxies found")],
      });
    }

    const text = response
      .map(
        (proxy) =>
          `http${proxy.ssl ? "s" : ""}://${proxy.domain} -> ${proxy.target}`
      )
      .join("\n");
    return interaction.reply({
      embeds: Util.splitMessage(text, { maxLength: 2048 }).map((t) =>
        createEmbed("Proxy List", t)
      ),
      ephemeral: true,
    });
  }
});

client.login(DISCORD_TOKEN);

function createEmbed(title: string, description: string) {
  return new MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(EMBED_COLOR);
}

interface IMetadata {
  domain: string;
  target: string;
  ssl: boolean;
}
