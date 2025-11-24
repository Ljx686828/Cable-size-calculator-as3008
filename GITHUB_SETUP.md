# GitHub Repository Setup Guide

This guide will help you create and push this project to GitHub.

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `cable-size-calculator-as3008` (or your preferred name)
   - **Description**: "A comprehensive web-based cable sizing calculator implementing AS/NZS 3008 standards for electrical cable selection"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository on GitHub, you'll see a page with setup instructions. Use the commands below:

### If you haven't committed anything yet:

```bash
git add .
git commit -m "Initial commit: Cable Size Calculator AS/NZS 3008"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cable-size-calculator-as3008.git
git push -u origin main
```

### If you've already made commits:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cable-size-calculator-as3008.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Update package.json

After pushing to GitHub, update the `package.json` file with your actual GitHub username:

1. Open `package.json`
2. Replace `yourusername` with your GitHub username in:
   - `repository.url`
   - `bugs.url`
   - `homepage`
3. Update the `author` field with your name and email
4. Commit and push the changes:

```bash
git add package.json
git commit -m "Update package.json with repository information"
git push
```

## Step 4: Add Repository Topics (Optional)

On your GitHub repository page:
1. Click the gear icon next to "About"
2. Add topics: `electrical`, `cable-sizing`, `as-nzs-3008`, `electrical-engineering`, `calculator`, `australian-standards`

## Step 5: Enable GitHub Pages (Optional)

To host your calculator on GitHub Pages:

1. Go to your repository **Settings**
2. Scroll to **Pages** in the left sidebar
3. Under **Source**, select **main** branch and **/ (root)** folder
4. Click **Save**
5. Your site will be available at: `https://YOUR_USERNAME.github.io/cable-size-calculator-as3008/`

## Troubleshooting

### Authentication Issues

If you encounter authentication issues when pushing:

**Option 1: Use Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` permissions
3. Use the token as your password when pushing

**Option 2: Use SSH**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add SSH key to GitHub: Settings → SSH and GPG keys → New SSH key
3. Change remote URL: `git remote set-url origin git@github.com:YOUR_USERNAME/cable-size-calculator-as3008.git`

### Large File Warning

If the PDF file is too large for GitHub (>100MB), you can:
1. Add it to `.gitignore` (already commented out)
2. Or use Git LFS: `git lfs track "*.pdf"`

## Next Steps

- Add a LICENSE file (MIT license is already referenced)
- Create issues for future enhancements
- Set up GitHub Actions for automated testing (if needed)
- Add collaborators if working in a team

## Quick Reference Commands

```bash
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View remote repository
git remote -v
```

