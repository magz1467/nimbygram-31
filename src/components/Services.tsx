
const Services = () => {
  return (
    <div className="bg-white py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground font-playfair">
          What We Offer
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-background rounded-xl shadow-sm overflow-hidden flex flex-col">
            <img
              src="/lovable-uploads/7f31740f-7092-44c6-be58-887ada6be464.png"
              alt="Local residents monitoring development"
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-semibold mb-3 text-foreground font-playfair">For Residents</h3>
              <p className="text-foreground mb-4 flex-1 font-sans">
                Easily comment for free on local developments. Stay informed and have your say on changes in your community.
              </p>
              <a 
                href="/resident-services" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary-dark h-10 px-4 py-2 w-full"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="bg-background rounded-xl shadow-sm overflow-hidden flex flex-col">
            <img
              src="/lovable-uploads/68757589-4c57-4ded-b8e5-a554c7d8cd6f.png"
              alt="Developer and resident reviewing planning documents"
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-semibold mb-3 text-foreground font-playfair">For Developers</h3>
              <p className="text-foreground mb-4 flex-1 font-sans">
                Get feedback on your project before decision day. Easily see other developments in the area and understand community sentiment.
              </p>
              <a 
                href="/developer-services" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary-dark h-10 px-4 py-2 w-full"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="bg-background rounded-xl shadow-sm overflow-hidden flex flex-col">
            <img
              src="/lovable-uploads/c8c1be52-f92b-4bfe-b3c9-a43e04162eb1.png"
              alt="Community members engaging with local planning"
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-semibold mb-3 text-foreground font-playfair">For Local Authorities</h3>
              <p className="text-foreground mb-4 flex-1 font-sans">
                Automate and accelerate your planning process. Streamline communication between residents and developers.
              </p>
              <a 
                href="/council-services" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary-dark h-10 px-4 py-2 w-full"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
