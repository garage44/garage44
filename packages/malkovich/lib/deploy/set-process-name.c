#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/prctl.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
    if (argc < 3) {
        fprintf(stderr, "Usage: %s <process_name> <command> [args...]\n", argv[0]);
        return 1;
    }

    const char *process_name = argv[1];

    // Set process name using prctl (Linux-specific) - sets /proc/PID/comm
    if (prctl(PR_SET_NAME, process_name, 0, 0, 0) != 0) {
        perror("prctl(PR_SET_NAME)");
        // Continue anyway - not fatal
    }

    // Modify argv[0] to the process name so ps shows it correctly
    // We need to create a new argv array with the process name as argv[0]
    char **new_argv = malloc((argc - 1) * sizeof(char*));
    if (!new_argv) {
        perror("malloc");
        return 1;
    }

    // Set argv[0] to process name (ps will show this)
    new_argv[0] = (char*)process_name;

    // Copy remaining arguments (skip argv[0] and argv[1] from original)
    for (int i = 2; i < argc; i++) {
        new_argv[i - 1] = argv[i];
    }
    new_argv[argc - 2] = NULL; // execvp expects NULL-terminated array

    // Execute the command with modified argv
    execvp(argv[2], new_argv);
    perror("execvp");
    free(new_argv);
    return 1;
}
