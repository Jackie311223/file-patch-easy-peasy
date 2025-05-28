// coverage-report.js
const fs = require('fs');
const path = require('path');

// Configuration
const testDirs = [
  'src/pages/Calendar/__tests__',
  'src/pages/Payments/__tests__',
  'src/pages/Invoices/__tests__',
  'cypress/integration/calendar'
];

const componentDirs = [
  'src/pages/Calendar/components',
  'src/pages/Payments/components',
  'src/pages/Invoices/components'
];

// Get all test files
function getTestFiles() {
  let testFiles = [];
  
  testDirs.forEach(dir => {
    try {
      const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.test.tsx') || file.endsWith('.spec.js') || file.endsWith('.spec.tsx'))
        .map(file => path.join(dir, file));
      
      testFiles = [...testFiles, ...files];
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  });
  
  return testFiles;
}

// Get all component files
function getComponentFiles() {
  let componentFiles = [];
  
  componentDirs.forEach(dir => {
    try {
      const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.tsx') && !file.endsWith('.test.tsx'))
        .map(file => path.join(dir, file));
      
      componentFiles = [...componentFiles, ...files];
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  });
  
  return componentFiles;
}

// Calculate coverage
function calculateCoverage() {
  const testFiles = getTestFiles();
  const componentFiles = getComponentFiles();
  
  console.log('Test Files:', testFiles.length);
  console.log('Component Files:', componentFiles.length);
  
  // Map components to their test files
  const coverage = {};
  
  componentFiles.forEach(componentFile => {
    const componentName = path.basename(componentFile, '.tsx');
    coverage[componentName] = {
      component: componentFile,
      tests: [],
      covered: false
    };
  });
  
  testFiles.forEach(testFile => {
    // Read test file content
    const content = fs.readFileSync(testFile, 'utf8');
    
    // Check which components are tested in this file
    Object.keys(coverage).forEach(componentName => {
      if (content.includes(componentName)) {
        coverage[componentName].tests.push(testFile);
        coverage[componentName].covered = true;
      }
    });
  });
  
  return coverage;
}

// Generate report
function generateReport() {
  const coverage = calculateCoverage();
  
  // Calculate statistics
  const totalComponents = Object.keys(coverage).length;
  const coveredComponents = Object.values(coverage).filter(c => c.covered).length;
  const coveragePercentage = (coveredComponents / totalComponents) * 100;
  
  // Generate report
  let report = '# UI Test Coverage Report\n\n';
  
  report += `## Summary\n\n`;
  report += `- Total Components: ${totalComponents}\n`;
  report += `- Covered Components: ${coveredComponents}\n`;
  report += `- Coverage Percentage: ${coveragePercentage.toFixed(2)}%\n\n`;
  
  report += `## Module Coverage\n\n`;
  
  // Group by module
  const modules = {
    Calendar: {
      total: 0,
      covered: 0,
      components: {}
    },
    Payments: {
      total: 0,
      covered: 0,
      components: {}
    },
    Invoices: {
      total: 0,
      covered: 0,
      components: {}
    }
  };
  
  Object.entries(coverage).forEach(([componentName, data]) => {
    let module;
    if (data.component.includes('Calendar')) {
      module = 'Calendar';
    } else if (data.component.includes('Payments')) {
      module = 'Payments';
    } else if (data.component.includes('Invoices')) {
      module = 'Invoices';
    } else {
      module = 'Other';
    }
    
    if (modules[module]) {
      modules[module].total++;
      if (data.covered) {
        modules[module].covered++;
      }
      modules[module].components[componentName] = data;
    }
  });
  
  // Add module coverage to report
  Object.entries(modules).forEach(([moduleName, data]) => {
    const modulePercentage = (data.covered / data.total) * 100;
    report += `### ${moduleName}\n\n`;
    report += `- Coverage: ${modulePercentage.toFixed(2)}% (${data.covered}/${data.total})\n\n`;
    
    // Add component details
    report += `| Component | Covered | Test Files |\n`;
    report += `|-----------|---------|------------|\n`;
    
    Object.entries(data.components).forEach(([componentName, componentData]) => {
      const testFiles = componentData.tests.map(f => path.basename(f)).join(', ');
      report += `| ${componentName} | ${componentData.covered ? '✅' : '❌'} | ${testFiles || 'None'} |\n`;
    });
    
    report += '\n';
  });
  
  // Add uncovered components section
  const uncoveredComponents = Object.entries(coverage)
    .filter(([_, data]) => !data.covered)
    .map(([name, _]) => name);
  
  if (uncoveredComponents.length > 0) {
    report += `## Uncovered Components\n\n`;
    uncoveredComponents.forEach(component => {
      report += `- ${component}\n`;
    });
    report += '\n';
  }
  
  // Add accessibility section
  report += `## Accessibility Testing\n\n`;
  report += `The following components have been tested for accessibility using jest-axe:\n\n`;
  
  const accessibilityTestedComponents = Object.entries(coverage)
    .filter(([_, data]) => {
      // Check if any test file contains accessibility testing
      return data.tests.some(testFile => {
        const content = fs.readFileSync(testFile, 'utf8');
        return content.includes('checkAccessibility') || content.includes('toHaveNoViolations');
      });
    })
    .map(([name, _]) => name);
  
  if (accessibilityTestedComponents.length > 0) {
    accessibilityTestedComponents.forEach(component => {
      report += `- ${component}\n`;
    });
  } else {
    report += `No components have explicit accessibility tests.\n`;
  }
  
  // Write report to file
  fs.writeFileSync('ui-test-coverage-report.md', report);
  console.log('Report generated: ui-test-coverage-report.md');
  
  return report;
}

// Run the report
generateReport();
