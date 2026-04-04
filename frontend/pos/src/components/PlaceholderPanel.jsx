const PlaceholderPanel = ({ title, description }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </section>
  );
};

export default PlaceholderPanel;
