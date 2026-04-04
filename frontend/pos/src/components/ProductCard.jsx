const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const ProductCard = ({ product, onAdd }) => {
  return (
    <button
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      onClick={() => onAdd(product.id)}
    >
      <div className="aspect-[1.15/1] overflow-hidden bg-slate-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f5f3ff_0%,#e2e8f0_100%)] text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
            {product.category}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium text-slate-900">{product.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                {product.category}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
              {product.prep_time_minutes}m
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-slate-950">{currency(product.price)}</span>
          <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition group-hover:bg-violet-600 group-hover:text-white">
            Add
          </span>
        </div>
      </div>
    </button>
  );
};

export default ProductCard;
