const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const ProductCard = ({ product, onAdd }) => {
  const imageSrc = product.image_url || product.imageUrl || '';

  return (
    <button
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onAdd(product)}
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#ede9fe_0%,#e2e8f0_100%)] px-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            {product.category}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-3">
        <div>
          <h3 className="text-sm font-medium text-slate-900">{product.name}</h3>
          <p className="mt-1 text-xs text-slate-500">Prep {product.prep_time_minutes} min</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-950">{currency(product.price)}</span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition group-hover:bg-violet-600 group-hover:text-white">
            Add
          </span>
        </div>
      </div>
    </button>
  );
};

export default ProductCard;
