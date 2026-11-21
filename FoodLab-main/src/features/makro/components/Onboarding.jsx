import { useState } from 'react';
import { ACTIVITY_LEVELS, GOAL_TYPES, calcGoals } from '../goals.js';
import { MEAL_COUNT_OPTIONS, buildPlan } from '../mealPlan.js';
import { fmt } from '../nutrition.js';

// Ankieta krok po kroku: pokazuje się, dopóki użytkownik nie ustawi celów (profile.done)
const LIMITS = { age: [14, 90], weight: [35, 200], height: [130, 220] };
const inRange = (v, [min, max]) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= min && n <= max;
};

const ACTIVITY_NOTES = {
  1.2: 'Praca przy biurku, mało ruchu',
  1.375: 'Spacery, czasem trening',
  1.55: 'Regularny sport kilka razy w tygodniu',
  1.725: 'Trening prawie codziennie',
};
const GOAL_NOTES = {
  lose: '400 kcal mniej niż zapotrzebowanie',
  keep: 'Tyle, ile spalasz',
  gain: '300 kcal więcej niż zapotrzebowanie',
};

function Choice({ selected, title, note, onClick }) {
  return (
    <button type="button" className="mk-choice" aria-pressed={selected} onClick={onClick}>
      <b>{title}</b>
      {note && <span>{note}</span>}
    </button>
  );
}

function NumberField({ id, label, unit, value, limits, onChange }) {
  const ok = inRange(value, limits);
  return (
    <div className="mk-numfield">
      <label htmlFor={id}>{label}</label>
      <div className="mk-numfield__box">
        <input id={id} type="number" inputMode="numeric" min={limits[0]} max={limits[1]} value={value}
          aria-invalid={!ok} onChange={(e) => onChange(e.target.value)} />
        <span>{unit}</span>
      </div>
      {!ok && <small>Podaj wartość od {limits[0]} do {limits[1]}.</small>}
    </div>
  );
}

export default function Onboarding({ profile, onFinish, onCancel }) {
  const [draft, setDraft] = useState(profile);
  const [step, setStep] = useState(0);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const steps = [
    {
      title: 'Zacznijmy od podstaw',
      lead: 'Płeć i wiek zmieniają podstawową przemianę materii.',
      valid: inRange(draft.age, LIMITS.age),
      body: (
        <>
          <div className="mk-choices mk-choices--2">
            <Choice selected={draft.sex === 'm'} title="Mężczyzna" onClick={() => set({ sex: 'm' })} />
            <Choice selected={draft.sex === 'k'} title="Kobieta" onClick={() => set({ sex: 'k' })} />
          </div>
          <NumberField id="mk-ob-age" label="Wiek" unit="lat" value={draft.age} limits={LIMITS.age} onChange={(v) => set({ age: v })} />
        </>
      ),
    },
    {
      title: 'Ile ważysz i mierzysz?',
      lead: 'Na tej podstawie liczymy, ile energii spalasz w spoczynku.',
      valid: inRange(draft.weight, LIMITS.weight) && inRange(draft.height, LIMITS.height),
      body: (
        <div className="mk-numrow">
          <NumberField id="mk-ob-weight" label="Waga" unit="kg" value={draft.weight} limits={LIMITS.weight} onChange={(v) => set({ weight: v })} />
          <NumberField id="mk-ob-height" label="Wzrost" unit="cm" value={draft.height} limits={LIMITS.height} onChange={(v) => set({ height: v })} />
        </div>
      ),
    },
    {
      title: 'Jak dużo się ruszasz?',
      lead: 'Wybierz to, co najlepiej opisuje zwykły tydzień.',
      valid: true,
      body: (
        <div className="mk-choices">
          {ACTIVITY_LEVELS.map((a) => (
            <Choice key={a.value} selected={Number(draft.activity) === a.value} title={a.label} note={ACTIVITY_NOTES[a.value]} onClick={() => set({ activity: a.value })} />
          ))}
        </div>
      ),
    },
    {
      title: 'Jaki masz cel?',
      lead: 'Od tego zależy, ile kalorii dziennie ustawimy.',
      valid: true,
      body: (
        <div className="mk-choices mk-choices--3">
          {GOAL_TYPES.map((g) => (
            <Choice key={g.value} selected={draft.goal === g.value} title={g.label} note={GOAL_NOTES[g.value]} onClick={() => set({ goal: g.value })} />
          ))}
        </div>
      ),
    },
    {
      title: 'Ile posiłków jesz dziennie?',
      lead: 'Podzielimy kalorie na posiłki i podpowiemy, ile zostało na następny.',
      valid: true,
      body: (
        <div className="mk-choices mk-choices--2">
          {MEAL_COUNT_OPTIONS.map((o) => (
            <Choice key={o.value} selected={Number(draft.meals) === o.value} title={`${o.value} ${o.value < 5 ? 'posiłki' : 'posiłków'}`}
              note={o.label.split(': ')[1]} onClick={() => set({ meals: o.value })} />
          ))}
        </div>
      ),
    },
  ];

  const isResult = step === steps.length;
  const goals = calcGoals(draft);
  const plan = buildPlan(goals.kcal, draft.meals);
  const current = steps[step];
  const total = steps.length + 1;

  return (
    <section className="mk-onboarding" aria-labelledby="mk-ob-title">
      <div className="mk-ob__progress" aria-hidden="true"><i style={{ width: `${((step + 1) / total) * 100}%` }} /></div>
      <span className="mk-ob__step">Krok {step + 1} z {total}</span>

      {!isResult ? (
        <>
          <h2 id="mk-ob-title" className="mk-ob__title">{current.title}</h2>
          <p className="mk-ob__lead">{current.lead}</p>
          <div className="mk-ob__body">{current.body}</div>
        </>
      ) : (
        <>
          <h2 id="mk-ob-title" className="mk-ob__title">Twój dzienny cel</h2>
          <p className="mk-ob__lead">Możesz to zmienić w każdej chwili w zakładce Cele.</p>
          <div className="mk-ob__result">
            <div className="mk-big">{fmt(goals.kcal)} <small>kcal dziennie</small></div>
            <div className="mk-split3">
              <div><i style={{ background: 'var(--mk-protein)' }} /><b>{goals.protein} g</b><span>białko</span></div>
              <div><i style={{ background: 'var(--mk-fat)' }} /><b>{goals.fat} g</b><span>tłuszcze</span></div>
              <div><i style={{ background: 'var(--mk-carbs)' }} /><b>{goals.carbs} g</b><span>węglowodany</span></div>
            </div>
            <div className="mk-plan">
              {plan.map((s) => (
                <div key={s.key}><span className="mk-plan__name">{s.name}</span><span>{s.pct}%</span><b>{fmt(s.target)} kcal</b></div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mk-ob__nav">
        {step > 0 ? (
          <button type="button" className="btn btn--ghost mk-ob__btn" onClick={() => setStep((s) => s - 1)}>Wstecz</button>
        ) : onCancel ? (
          <button type="button" className="btn btn--ghost mk-ob__btn" onClick={onCancel}>Anuluj</button>
        ) : <span />}
        {!isResult ? (
          <button type="button" className="btn btn--primary mk-ob__btn" disabled={!current.valid} onClick={() => setStep((s) => s + 1)}>Dalej</button>
        ) : (
          <button type="button" className="btn btn--primary mk-ob__btn" onClick={() => onFinish({ ...draft, done: true })}>Zaczynamy</button>
        )}
      </div>
    </section>
  );
}
