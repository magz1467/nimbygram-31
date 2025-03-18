const fs = require('fs');
const path = require('path');

// Function to find all import statements in a file
function findImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[^\s;]+|[^\s;{},]+)\s+from\s+['"]([^'"]+)['"]/g;
    const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
    
    const imports = [];
    let match;
    
    // Find static imports
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Find dynamic imports
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Function to recursively scan a directory for files
function scanDirectory(dir, fileExtensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const files = [];
  
  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && fileExtensions.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// Main function
function checkDependencies() {
  console.log('Checking project dependencies...');
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  // Scan src directory for files
  const srcFiles = scanDirectory('src');
  
  // Find all imports
  const allImports = new Set();
  for (const file of srcFiles) {
    const imports = findImports(file);
    for (const imp of imports) {
      // Only consider package imports (not relative imports)
      if (!imp.startsWith('.') && !imp.startsWith('/')) {
        // Extract the package name (e.g., '@tanstack/react-query/something' -> '@tanstack/react-query')
        const packageName = imp.startsWith('@') 
          ? imp.split('/').slice(0, 2).join('/')
          : imp.split('/')[0];
        
        allImports.add(packageName);
      }
    }
  }
  
  // Check if all imports are in dependencies
  const missingDependencies = [];
  for (const imp of allImports) {
    if (!dependencies[imp]) {
      missingDependencies.push(imp);
    }
  }
  
  if (missingDependencies.length > 0) {
    console.error('Missing dependencies found:');
    for (const dep of missingDependencies) {
      console.error(`- ${dep}`);
    }
    console.error('Please add these dependencies to your package.json');
  } else {
    console.log('All dependencies are properly declared in package.json');
  }
  
  // Write the results to a file
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: srcFiles.length,
    totalImports: allImports.size,
    declaredDependencies: Object.keys(dependencies).length,
    missingDependencies
  };
  
  fs.writeFileSync('dependency-report.json', JSON.stringify(report, null, 2));
  console.log('Dependency report written to dependency-report.json');
}

checkDependencies(); 