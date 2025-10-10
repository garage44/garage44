#!/usr/bin/env bash
# Script to fix imports in all component files

COMPONENTS_DIR="/home/deck/code/expressio/packages/pyrite/src/components"

# Fix common imports
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i \
    -e "s/from '@\/lib\/main\.js'/from '@\/app'/g" \
    -e "s/from '@\/lib\/main'/from '@\/app'/g" \
    -e "s/import {app}/import {\\$s, notifier}/g" \
    -e "s/app\.\$s/\\$s/g" \
    -e "s/app\.notifier/notifier/g" \
    -e "s/app\.\$t/\\$t/g" \
    -e "s/app\.api/api/g" \
    -e "s/app\.logger/logger/g" \
    -e "s/from 'vue'/from 'preact'/g" \
    -e "s/from 'vue-router'/from 'preact-router'/g" \
    -e "s/, ref,/, useRef,/g" \
    -e "s/, reactive,/,/g" \
    -e "s/import {defineComponent/import {h/g" \
    {} \;

echo "Import fixes applied to all components"

