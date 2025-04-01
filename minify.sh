#!/bin/bash

# Compile all .ts files to .js
#find . -type f -name "*.ts" ! -name "*.d.ts" ! -path "./libs/*" | while read -r tsfile; do
#    # Compile the TypeScript file to JavaScript
#    tsc "$tsfile"
#done

# Find all .js files in the current directory and subdirectories
find . -type f -name "*.js" ! -name "*.minified.js" ! -name "rollup.config.js" ! -path "./libs/*" ! -path "./node_modules/*" ! -path "./src/*" | while read -r file; do
    # Define the output file name
    minified_file="${file%.js}.minified.js"

    # Minify the file using terser
    terser "$file" -c -m -o "$minified_file"

    # Print the result
    echo "Minified $file to $minified_file"
done
