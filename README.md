# Tweak - A Minimalistic Version Control System

Tweak is a simple, lightweight version control system built with Node.js. It provides basic functionality to manage file versions, allowing you to track changes, commit them, and view the difference between file versions.

## Features

- **Initialize a Repository**: Start a new Tweak repository to track your project's files.
- **Add Files**: Stage files to be committed to the repository.
- **Commit Changes**: Save changes to the repository with a descriptive message.
- **View Commit History**: Display a log of all commits in the repository.
- **Show Differences**: Compare changes between different commits.

## Installation

First, clone the repository or download the source code:

```bash
git clone https://github.com/yourusername/tweak.git
cd tweak
```

Install the necessary dependencies:

```bash
npm install
```

## Usage

### Initialize a Repository

To start tracking files in a directory, initialize a new Tweak repository:

```bash
./tweak.js init
```

This will create a `.tweak` directory in your project where all version control data will be stored.

### Add Files

Add files to the staging area, preparing them to be committed:

```bash
./tweak.js add <file>
```

Replace `<file>` with the path to the file you want to add.

### Commit Changes

Commit the staged files to the repository with a message describing the changes:

```bash
./tweak.js commit "Your commit message"
```

### View Commit History

See a log of all the commits made to the repository:

```bash
./tweak.js log
```

### Show Differences Between Commits

View the differences between the files in a specific commit and its parent commit:

```bash
./tweak.js show <commit>
```

Replace `<commit>` with the hash of the commit you want to compare.

## Example Workflow

1. **Initialize the repository**: 
   ```bash
   ./tweak.js init
   ```

2. **Add files to the staging area**:
   ```bash
   ./tweak.js add file1.txt
   ./tweak.js add file2.txt
   ```

3. **Commit the staged changes**:
   ```bash
   ./tweak.js commit "Initial commit"
   ```

4. **Check the commit history**:
   ```bash
   ./tweak.js log
   ```

5. **Show differences for a specific commit**:
   ```bash
   ./tweak.js show <commit>
   ```

## Technical Overview

Tweak is built using Node.js and takes advantage of several core modules:

- **Path**: Handles and transforms file paths.
- **File System (fs)**: Interacts with the file system for reading and writing files.
- **Crypto**: Generates SHA-1 hashes for file content and commits.
- **Diff**: Compares file differences between commits.
- **Chalk**: Colors the terminal output for better readability.

### File Structure

- `.tweak/objects/`: Stores all files and commits as hashed objects.
- `.tweak/HEAD`: Points to the latest commit.
- `.tweak/index`: Maintains a list of staged files.

### Commit Structure

Each commit is stored as a JSON object containing:

- **timestamp**: The date and time of the commit.
- **message**: The commit message provided by the user.
- **files**: An array of files included in the commit, with their paths and corresponding hashes.
- **parent**: The hash of the parent commit.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes.

## Contact

For any questions or feedback, please reach out to [arnavsavant1712@gmail.com](mailto:arnavsavant1712@gmail.com).

---