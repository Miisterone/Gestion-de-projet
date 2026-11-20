// Neighbourhood list of the register and profile forms. The zones come from GET /api/zones.
export default function ZoneSelect({ zones, value, onChange, isLoading = false, error = '', required = true }) {
  return (
    <div>
      <label className="field-label" htmlFor="zoneId">
        Mon quartier
      </label>
      <select
        id="zoneId"
        name="zoneId"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        disabled={isLoading || !!error}
        aria-describedby={error ? 'zoneId-error' : undefined}
        required={required}
      >
        <option value="">{isLoading ? 'Chargement des quartiers...' : 'Choisissez votre quartier'}</option>
        {zones.map((zone) => (
          <option key={zone.id} value={zone.id}>
            {zone.name} ({zone.city})
          </option>
        ))}
      </select>
      {error && (
        <p className="error" id="zoneId-error">
          {error}
        </p>
      )}
    </div>
  );
}
