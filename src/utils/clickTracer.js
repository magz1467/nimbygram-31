// Simple implementation of clickTracer
export function installClickTracer() {
  console.log('Click tracer installed');
  
  // Track clicks
  const clickHandler = (e) => {
    const target = e.target;
    const tagName = target.tagName.toLowerCase();
    const className = target.className;
    const id = target.id;
    
    console.log('Click:', {
      tagName,
      className,
      id,
      text: target.innerText?.substring(0, 20) || '',
      href: target.href || '',
    });
  };
  
  // Add click listener
  document.addEventListener('click', clickHandler);
  
  // Return a cleanup function
  return () => {
    document.removeEventListener('click', clickHandler);
  };
} 