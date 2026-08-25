'use client';

import React, { useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { TutorMascot } from '../mascot/TutorMascot';
import {
  X,
  Sparkles,
  ShoppingBag,
  Check,
  Shield,
  GraduationCap,
  Glasses,
  Crown,
  Wand2,
  BookOpen,
  Flame,
} from 'lucide-react';

interface MascotWardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  type: 'hat' | 'accessory' | 'aura';
  cost: number;
  icon: any;
  desc: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Шапки
  { id: 'mortarboard', name: 'Конфедератка магистра', type: 'hat', cost: 0, icon: GraduationCap, desc: 'Классический головной убор выпускника' },
  { id: 'glasses', name: 'Очки всезнайки', type: 'hat', cost: 40, icon: Glasses, desc: 'Повышают интеллект и точность расчетов' },
  { id: 'crown', name: 'Корона победителя олимпиад', type: 'hat', cost: 100, icon: Crown, desc: 'Награда для настоящих лидеров рейтинга' },

  // Аксессуары
  { id: 'pointer', name: 'Лазерная указка', type: 'accessory', cost: 0, icon: Wand2, desc: 'Точно указывает на ключевые формулы' },
  { id: 'book', name: 'Гримуар формул ФИПИ', type: 'accessory', cost: 50, icon: BookOpen, desc: 'Сборник всех теорем и доказательств' },

  // Ауры
  { id: 'emerald', name: 'Изумрудный свет', type: 'aura', cost: 0, icon: Sparkles, desc: 'Спокойное свечение концентрации' },
  { id: 'gold', name: 'Золотой чемпион', type: 'aura', cost: 80, icon: Flame, desc: 'Сияние для учеников с длинными стриками' },
  { id: 'cyberpunk', name: 'Киберпанк-неон', type: 'aura', cost: 120, icon: ZapIcon, desc: 'Футуристический фиолетово-розовый ореол' },
];

function ZapIcon(props: any) {
  return <Sparkles {...props} />;
}

export const MascotWardrobeModal: React.FC<MascotWardrobeModalProps> = ({ isOpen, onClose }) => {
  const {
    xp,
    crystals,
    streakFreezes,
    equippedHat,
    equippedAccessory,
    equippedAura,
    unlockedItems,
    buyItem,
    equipItem,
    buyStreakFreeze,
  } = useChatStore();

  const [activeTab, setActiveTab] = useState<'hats' | 'accessories' | 'auras' | 'freeze'>('hats');

  if (!isOpen) return null;

  const hats = SHOP_ITEMS.filter((i) => i.type === 'hat');
  const accessories = SHOP_ITEMS.filter((i) => i.type === 'accessory');
  const auras = SHOP_ITEMS.filter((i) => i.type === 'aura');

  const currentList = activeTab === 'hats' ? hats : activeTab === 'accessories' ? accessories : auras;

  const isEquipped = (item: ShopItem) => {
    if (item.type === 'hat') return equippedHat === item.id;
    if (item.type === 'accessory') return equippedAccessory === item.id;
    if (item.type === 'aura') return equippedAura === item.id;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-3xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden text-slate-900">
        
        {/* Шапка модалки */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl shadow-inner">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Гардероб Наставника & Магазин Наград
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Кастомизируйте маскота и защищайте стрик за кристаллы</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Баланс ученика */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span className="text-amber-600 flex items-center gap-1">
                💎 {crystals}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-600">
                {xp} XP
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 border border-slate-200 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ПРИМЕРОЧНАЯ КОМНАТА: Маскот в реальном времени */}
        <div className="py-4 px-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <TutorMascot size="lg" state="idle" />
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Живая примерка</span>
              <h3 className="text-sm font-black text-slate-900">Твой AI-Наставник</h3>
              <p className="text-xs text-slate-500">Все изменения сразу отображаются в чате урока!</p>
            </div>
          </div>

          {/* Щит Заморозки Стрика */}
          <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-2xl flex items-center gap-2.5 text-xs shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Заморозка стрика:</span>
              <strong className="text-slate-800 text-xs">{streakFreezes > 0 ? `❄️ Активно (${streakFreezes} шт)` : '❌ Нет щита'}</strong>
            </div>
          </div>
        </div>

        {/* Табы магазина */}
        <div className="flex gap-2 py-3 border-b border-slate-200 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('hats')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'hats' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap size={14} /> Шапки ({hats.length})
          </button>
          <button
            onClick={() => setActiveTab('accessories')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'accessories' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 size={14} /> Аксессуары ({accessories.length})
          </button>
          <button
            onClick={() => setActiveTab('auras')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'auras' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={14} /> Ауры ({auras.length})
          </button>
          <button
            onClick={() => setActiveTab('freeze')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'freeze' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield size={14} /> ❄️ Купить Заморозку
          </button>
        </div>

        {/* Сетка товаров */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {activeTab === 'freeze' ? (
            /* Секция покупки Заморозки Стрика */
            <div className="bg-slate-50 border border-blue-200 p-6 rounded-2xl space-y-4 max-w-lg mx-auto text-center shadow-xs">
              <div className="w-14 h-14 bg-blue-100 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                <Shield size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Щит «Заморозка удара»</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Если вы пропустите один день занятий (уехали или заболели), щит автоматически защитит вашу серию <strong className="text-amber-600">🔥 Стрика</strong> от сгорания!
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => buyStreakFreeze(40)}
                  disabled={crystals < 40}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition shadow-sm shadow-blue-600/20 inline-flex items-center gap-2 active:scale-95"
                >
                  <span>Купить защиту за 40 💎</span>
                </button>
              </div>
            </div>
          ) : (
            /* Сетка кастомизации */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentList.map((item) => {
                const ItemIcon = item.icon;
                const unlocked = unlockedItems.includes(item.id) || item.cost === 0;
                const equipped = isEquipped(item);

                return (
                  <div
                    key={item.id}
                    className={`bg-slate-50/70 border p-4 rounded-2xl flex flex-col justify-between gap-3 transition shadow-2xs ${
                      equipped
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-amber-600 shadow-2xs">
                          <ItemIcon size={20} />
                        </div>
                        {equipped ? (
                          <span className="text-[10px] font-black bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={11} /> Надето
                          </span>
                        ) : unlocked ? (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                            В гардеробе
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                            {item.cost} 💎
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>

                    <div>
                      {equipped ? (
                        <button
                          onClick={() => equipItem('none', item.type)}
                          className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold py-2 rounded-xl transition"
                        >
                          Снять
                        </button>
                      ) : unlocked ? (
                        <button
                          onClick={() => equipItem(item.id, item.type)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl transition shadow-xs"
                        >
                          Надеть
                        </button>
                      ) : (
                        <button
                          onClick={() => buyItem(item.id, item.cost, item.type)}
                          disabled={crystals < item.cost}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold py-2 rounded-xl transition shadow-xs flex items-center justify-center gap-1"
                        >
                          Купить за {item.cost} 💎
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Подвал */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>Кристаллы 💎 начисляются за правильные ответы и регулярность занятий</span>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};