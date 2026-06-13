import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Food, NovaGroup } from "../types";
import { brazilianFoods } from "../data/foods";
import {
  foodCategories,
  getNovaGroup,
  NOVA_LABELS,
  glycemicLoad,
  glLevel,
  GLYCEMIC_TONE,
  GLYCEMIC_LABEL,
  getFoodName,
  getFoodCategoryName,
} from "../services/foodService";
import { SearchIcon, ClipboardListIcon, PlusIcon } from "../components/icons";
import { PageHeader, Input, Button, Modal } from "../components/ui";

const CUSTOM_FOODS_KEY = "customFoods";
const PAGE_SIZE = 40;

const loadCustomFoods = (): Food[] => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_FOODS_KEY) || "[]");
  } catch {
    return [];
  }
};

const FoodDatabase: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [novaFilter, setNovaFilter] = useState<string>("Todos");
  const [page, setPage] = useState(0);
  const [customFoods, setCustomFoods] = useState<Food[]>(loadCustomFoods);
  const [displayedFoods, setDisplayedFoods] = useState<Food[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFood, setNewFood] = useState({
    name: "",
    category: "Outros",
    portion: 100,
    unit: "g",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [addError, setAddError] = useState("");

  const allFoods = useMemo(
    () => [...brazilianFoods, ...customFoods],
    [customFoods],
  );

  const NOVA_FILTERS: { key: string; label: string; groups: NovaGroup[] }[] =
    useMemo(
      () => [
        { key: "Todos", label: t("food_database.all"), groups: [1, 2, 3, 4] },
        {
          key: "in_natura",
          label: t("food_database.in_natura"),
          groups: [1, 2],
        },
        { key: "processado", label: t("food_database.processed"), groups: [3] },
        {
          key: "ultra",
          label: t("food_database.ultra_processed"),
          groups: [4],
        },
      ],
      [t],
    );

  const handleAddFood = () => {
    if (!newFood.name.trim()) {
      setAddError(t("food_database.add_modal.errors.name_required"));
      return;
    }
    if (
      newFood.calories < 0 ||
      newFood.protein < 0 ||
      newFood.carbs < 0 ||
      newFood.fat < 0
    ) {
      setAddError(t("food_database.add_modal.errors.negative_values"));
      return;
    }
    const food: Food = {
      id: `custom_${Date.now()}`,
      name: newFood.name.trim(),
      category: newFood.category,
      portion: String(newFood.portion),
      unit: newFood.unit,
      calories: newFood.calories,
      protein: newFood.protein,
      carbs: newFood.carbs,
      fat: newFood.fat,
      fiber: 0,
      sodium: 0,
    };
    const updated = [...customFoods, food];
    setCustomFoods(updated);
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(updated));
    setShowAddModal(false);
    setNewFood({
      name: "",
      category: "Outros",
      portion: 100,
      unit: "g",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
    setAddError("");
  };

  useEffect(() => {
    let foods = allFoods;
    if (selectedCategory !== "Todos") {
      foods = foods.filter((food) => food.category === selectedCategory);
    }
    if (novaFilter !== "Todos") {
      const groups =
        NOVA_FILTERS.find((f) => f.key === novaFilter)?.groups || [];
      foods = foods.filter((food) => groups.includes(getNovaGroup(food)));
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      foods = foods.filter((f) => {
        const localizedName = getFoodName(f).toLowerCase();
        const localizedCategory = getFoodCategoryName(f.category).toLowerCase();
        return localizedName.includes(term) || localizedCategory.includes(term);
      });
    }
    setDisplayedFoods(foods);
    setPage(0);
  }, [searchTerm, selectedCategory, novaFilter, allFoods, NOVA_FILTERS]);

  const categories = useMemo(() => ["Todos", ...foodCategories], []);
  const getCategoryLabel = (c: string) => {
    if (c === "Todos") return t("food_database.all");
    return getFoodCategoryName(c);
  };

  const pageCount = Math.max(1, Math.ceil(displayedFoods.length / PAGE_SIZE));
  const pagedFoods = displayedFoods.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        icon={<ClipboardListIcon className="w-6 h-6" />}
        title={t("food_database.title")}
        subtitle={t("food_database.subtitle")}
        actions={
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-72">
              <Input
                leftIcon={<SearchIcon className="h-4 w-4" />}
                placeholder={t("food_database.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowAddModal(true)} size="sm">
              <PlusIcon className="w-4 h-4 mr-1" /> {t("food_database.add_btn")}
            </Button>
          </div>
        }
      />

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3.5 py-1.5 text-sm font-semibold rounded-full transition-all ${
              selectedCategory === category
                ? "bg-sage-600 text-white shadow-sm shadow-sage-600/25"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Processing (NOVA) filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
          {t("food_database.processing_label")}
        </span>
        {NOVA_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setNovaFilter(f.key)}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              novaFilter === f.key
                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {[
                  [t("food_database.headers.name"), ""],
                  [
                    t("food_database.headers.processing"),
                    "hidden lg:table-cell",
                  ],
                  [t("food_database.headers.portion"), ""],
                  [t("food_database.headers.calories"), ""],
                  [t("food_database.headers.protein"), "hidden sm:table-cell"],
                  [t("food_database.headers.carbs"), "hidden sm:table-cell"],
                  [t("food_database.headers.fat"), "hidden sm:table-cell"],
                  [
                    t("food_database.headers.glycemic_load"),
                    "hidden lg:table-cell",
                  ],
                ].map(([label, cls]) => (
                  <th
                    key={label}
                    className={`px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider ${cls}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pagedFoods.length > 0 ? (
                pagedFoods.map((food) => {
                  const nova = getNovaGroup(food);
                  const gl = glycemicLoad(food);
                  const lvl = glLevel(gl);
                  return (
                    <tr
                      key={food.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {getFoodName(food)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {getFoodCategoryName(food.category)}
                        </p>
                      </td>
                      <td className="px-6 py-3.5 hidden lg:table-cell whitespace-nowrap">
                        <span
                          className={`badge ${NOVA_LABELS[nova].tone}`}
                          title={NOVA_LABELS[nova].full}
                        >
                          {NOVA_LABELS[nova].short}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                        {food.portion}
                        {food.unit}
                      </td>
                      <td className="px-6 py-3.5 text-sm font-bold text-sage-700 dark:text-sage-300 whitespace-nowrap">
                        {food.calories.toFixed(1)}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-500 hidden sm:table-cell">
                        {food.protein.toFixed(1)}g
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-500 hidden sm:table-cell">
                        {food.carbs.toFixed(1)}g
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-500 hidden sm:table-cell">
                        {food.fat.toFixed(1)}g
                      </td>
                      <td className="px-6 py-3.5 hidden lg:table-cell whitespace-nowrap">
                        {lvl ? (
                          <span
                            className={`badge ${GLYCEMIC_TONE[lvl]}`}
                            title={`Carga glicêmica ${gl}`}
                          >
                            {gl} · {GLYCEMIC_LABEL[lvl]}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <ClipboardListIcon className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {t("food_database.empty.title")}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {t("food_database.empty.desc")}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {t("food_database.summary", {
            count: displayedFoods.length,
            custom: customFoods.length,
          })}
        </p>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              {t("food_database.prev")}
            </Button>
            <span className="text-sm text-slate-500 font-medium px-1">
              {t("food_database.page_info", {
                current: page + 1,
                total: pageCount,
              })}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
            >
              {t("food_database.next")}
            </Button>
          </div>
        )}
      </div>

      {/* Modal de adicionar alimento */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddError("");
        }}
        title={t("food_database.add_modal.title")}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                setAddError("");
              }}
            >
              {t("food_database.add_modal.cancel_btn")}
            </Button>
            <Button onClick={handleAddFood}>
              {t("food_database.add_modal.save_btn")}
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-1">
          <div>
            <label className="input-label">
              {t("food_database.add_modal.name_label")}
            </label>
            <input
              className="input-field"
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              placeholder="Ex.: Pão de queijo"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">
                {t("food_database.add_modal.category_label")}
              </label>
              <select
                className="input-field"
                value={newFood.category}
                onChange={(e) =>
                  setNewFood({ ...newFood, category: e.target.value })
                }
              >
                {[...foodCategories, "Outros"].map((c) => (
                  <option key={c} value={c}>
                    {getCategoryLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">
                {t("food_database.add_modal.portion_label")}
              </label>
              <input
                type="number"
                className="input-field"
                value={newFood.portion}
                onChange={(e) =>
                  setNewFood({
                    ...newFood,
                    portion: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">
                {t("food_database.add_modal.calories_label")}
              </label>
              <input
                type="number"
                className="input-field"
                value={newFood.calories}
                onChange={(e) =>
                  setNewFood({
                    ...newFood,
                    calories: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="input-label">
                {t("food_database.add_modal.protein_label")}
              </label>
              <input
                type="number"
                className="input-field"
                value={newFood.protein}
                onChange={(e) =>
                  setNewFood({
                    ...newFood,
                    protein: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="input-label">
                {t("food_database.add_modal.carbs_label")}
              </label>
              <input
                type="number"
                className="input-field"
                value={newFood.carbs}
                onChange={(e) =>
                  setNewFood({
                    ...newFood,
                    carbs: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="input-label">
                {t("food_database.add_modal.fat_label")}
              </label>
              <input
                type="number"
                className="input-field"
                value={newFood.fat}
                onChange={(e) =>
                  setNewFood({
                    ...newFood,
                    fat: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          {addError && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              {addError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FoodDatabase;
