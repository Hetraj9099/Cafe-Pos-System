const PlaceholderPanel = ({ title, description }) => {
  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-lg shadow-orange-100/50">
      <h2 className="text-2xl font-semibold text-stone-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-stone-700">{description}</p>
    </section>
  );
};

export default PlaceholderPanel;
