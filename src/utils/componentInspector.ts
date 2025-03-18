/**
 * This utility inspects React components to find map-related functionality
 */

export function installComponentInspector() {
  console.log('🔍 Installing component inspector');
  
  // Wait for React to be fully loaded
  setTimeout(() => {
    try {
      // Find all React fiber nodes
      const findReactNodes = () => {
        const nodes = [];
        let rootNode = document.querySelector('#root')?.__reactFiber$;
        
        if (!rootNode) {
          // Try alternative React fiber property names
          const rootElement = document.querySelector('#root');
          if (rootElement) {
            const reactKeys = Object.keys(rootElement).filter(key => 
              key.startsWith('__reactFiber$') || 
              key.startsWith('__reactInternalInstance$')
            );
            
            if (reactKeys.length > 0) {
              rootNode = rootElement[reactKeys[0]];
            }
          }
        }
        
        if (!rootNode) {
          console.log('❌ Could not find React root node');
          return nodes;
        }
        
        const traverseFiber = (fiber) => {
          if (!fiber) return;
          
          // Check if this is a component with a name
          if (fiber.type && typeof fiber.type === 'function' && fiber.type.name) {
            nodes.push({
              name: fiber.type.name,
              fiber
            });
          }
          
          // Traverse child
          if (fiber.child) traverseFiber(fiber.child);
          
          // Traverse sibling
          if (fiber.sibling) traverseFiber(fiber.sibling);
        };
        
        traverseFiber(rootNode);
        return nodes;
      };
      
      // Find map-related components
      const reactNodes = findReactNodes();
      console.log(`🔍 Found ${reactNodes.length} React components`);
      
      const mapComponents = reactNodes.filter(node => 
        node.name.toLowerCase().includes('map')
      );
      
      console.log(`🔍 Found ${mapComponents.length} map-related components:`, 
        mapComponents.map(c => c.name)
      );
      
      // Inspect props and state of map components
      mapComponents.forEach(component => {
        try {
          const props = component.fiber.memoizedProps;
          const state = component.fiber.memoizedState;
          
          console.log(`🔍 Component ${component.name}:`, {
            props,
            state
          });
          
          // Look for onClick handlers
          if (props && props.onClick) {
            console.log(`🔍 Found onClick handler in ${component.name}`);
          }
          
          // Look for navigation-related props
          if (props && (props.navigate || props.history || props.to || props.href)) {
            console.log(`🔍 Found navigation props in ${component.name}:`, 
              props.navigate || props.history || props.to || props.href
            );
          }
        } catch (err) {
          console.log(`❌ Error inspecting component ${component.name}:`, err);
        }
      });
      
      // Also look for any components with "button" in the name
      const buttonComponents = reactNodes.filter(node => 
        node.name.toLowerCase().includes('button')
      );
      
      console.log(`🔍 Found ${buttonComponents.length} button components`);
      
      // Check for map-related buttons
      buttonComponents.forEach(component => {
        try {
          const props = component.fiber.memoizedProps;
          if (props) {
            const propsString = JSON.stringify(props);
            if (propsString.toLowerCase().includes('map')) {
              console.log(`🔍 Found map-related button: ${component.name}`, props);
            }
          }
        } catch (err) {
          console.log(`❌ Error inspecting button ${component.name}:`, err);
        }
      });
      
    } catch (err) {
      console.log('❌ Error in component inspector:', err);
    }
  }, 3000);
  
  console.log('✅ Component inspector installed');
} 