#!/bin/bash

# Mock lakectl script for testing with correct output format
case "$1" in
    "--version")
        echo "lakectl version 0.1.0"
        exit 0
        ;;
    "local")
        if [[ "$2" == "status" ]]; then
            echo "On branch main"
            echo ""
            echo "Changes to be committed:"
            echo "  (use \"lakectl local reset HEAD -- <file>...\" to unstage)"
            echo ""
            echo "        modified:   src/extension.ts"
            echo "        new file:   src/lakefsPanelProvider.ts"
            echo "        new file:   src/lakectlService.ts"
            echo ""
            echo "Changes not staged for commit:"
            echo "  (use \"lakectl local add <file>...\" to update what will be committed)"
            echo "  (use \"lakectl local checkout -- <file>...\" to discard changes in working directory)"
            echo ""
            echo "        modified:   package.json"
            exit 0
        elif [[ "$2" == "commit" ]]; then
            echo "Successfully committed to LakeFS"
            echo "Commit hash: 1a2b3c4d5e6f7g8h9i0j"
            exit 0
        elif [[ "$2" == "checkout" ]]; then
            echo "Successfully checked out $6"
            echo "Updated working directory"
            exit 0
        fi
        ;;
    "branch")
        if [[ "$2" == "list" ]]; then
            # Output tab-separated format like real lakectl
            echo -e "exp-20250914\t4910b0ebca5bfc0a78b52ee455dab724f8e9a5d0fd59c1eef53c42be0130a1e2"
            echo -e "main\t474a8e60c804d2d59a55e8bb278d360ee31fb7abe7a913139cd9fe8034060d79"
            exit 0
        fi
        ;;
esac

echo "Usage: $0 [--version|local status|local commit|local checkout|branch list ...]"
exit 1