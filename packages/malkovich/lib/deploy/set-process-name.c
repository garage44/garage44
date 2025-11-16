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

    // Set process name using prctl (Linux-specific)
    if (prctl(PR_SET_NAME, process_name, 0, 0, 0) != 0) {
        perror("prctl(PR_SET_NAME)");
        // Continue anyway - not fatal
    }

    // Execute the command with remaining arguments
    execvp(argv[2], &argv[2]);
    perror("execvp");
    return 1;
}
