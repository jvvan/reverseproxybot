import { SlashCommandBuilder } from "@discordjs/builders";

export const commands = [
  new SlashCommandBuilder()
    .setName("proxy")
    .setDescription("Make a reverse proxy")
    .addStringOption((option) =>
      option
        .setName("domain")
        .setDescription("Domain to proxy (Example: domain.com)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("target")
        .setDescription("Target (Example: http://127.0.0.1:8080)")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("ssl")
        .setDescription("Do you want to use ssl? (Default: True)")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("proxydelete")
    .setDescription("Delete a reverse proxy")
    .addStringOption((option) =>
      option
        .setName("domain")
        .setDescription("Domain to delete")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("keep_certificate")
        .setDescription("Do you want to keep the certificate? (Default: False)")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("proxylist")
    .setDescription("List all reverse proxies"),

  new SlashCommandBuilder()
    .setName("stream")
    .setDescription("Make a stream")
    .addStringOption((option) =>
      option.setName("name").setDescription("Name").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("listen")
        .setDescription("Listen (Example: 0.0.0.0:8080)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("target")
        .setDescription("Target (Example: 127.0.0.1:8181)")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("streamdelete")
    .setDescription("Delete a stream")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the stream to delete")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("streamlist")
    .setDescription("List all streams"),
];
