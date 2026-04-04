const PlaceholderPanel = ({ title, description }) => {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-100/50">
      <h2 className="text-2xl font-semibold text-emerald-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-emerald-900/70">{description}</p>
    </section>
  );
};

export default PlaceholderPanel;
Code.txt