# Troubleshooting

## Error Acquiring Credentials: kubectl Plugin Unavailable

During Telepresence’s attempt to authenticate with your cluster, the system was unable to locate the kubectl plugin binary. If connecting to your cluster via alternative methods doesn’t pose an issue, it is likely that the binary hasn’t been correctly configured in the path accessed by the plugin terminal.

To remedy this, you can add the kubectl plugin binary to the path specified in either the `.zprofile` or `.bashrc` file located in your user directory. The file you need to modify depends on the shell you are using. For instance, if you're using zsh, you'd modify the `.zshrc` file, and if you're using bash, you'd modify the `.bashrc` file.