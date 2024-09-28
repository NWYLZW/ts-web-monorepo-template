# use directory name as project name and let user confirm it or input a new one
echo "Enter the new project name: (default: $(basename "$(pwd)"), press Enter to use default)"
read -r new_project_name
new_project_name=${new_project_name:-$(basename "$(pwd)")}
echo "New project name: $new_project_name"

# use git config user.name as author name and let user confirm it or input a new one
echo "Enter the new author name: (default: $(git config user.name), press Enter to use default)"
read -r new_author_name
new_author_name=${new_author_name:-$(git config user.name)}
echo "New author name: $new_author_name"

# replace 'mono' string in this directory all files with new_project_name
grep -rl --exclude-dir={.git,node_modules} --exclude='*.md' 'mono' .\
  | xargs sed -i '' -e "s/mono/$new_project_name/g"
# replace 'YiJie' string in this directory all files with new_author_name
grep -rl --exclude-dir={.git,node_modules} --exclude='*.md' 'YiJie' .\
  | xargs sed -i '' -e "s/YiJie/$new_author_name/g"
