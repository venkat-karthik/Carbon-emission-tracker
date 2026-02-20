# CSV Upload Guide

## 📊 Upload CSV Data and See It Everywhere!

Your GreenIndex dashboard now supports CSV file uploads that automatically update all pages and charts in real-time.

---

## 🎯 Quick Start

1. Go to **Data Input** page
2. Click **Upload CSV** tab
3. Drag & drop your CSV file or click to browse
4. Data is instantly processed and reflected across:
   - Dashboard metrics
   - Analytics charts
   - Alerts system
   - Reports
   - Leaderboard

---

## 📋 CSV Format

### Required Columns:

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `timestamp` | ISO 8601 | Date and time of reading | `2026-02-20T10:00:00Z` |
| `zone` | String | Location/building name | `Block A` |
| `category` | String | Data category | `energy`, `water`, `waste`, `transport` |
| `value` | Number | Measurement value | `12500` |
| `source` | String | Data source | `PZEM-004T`, `Manual` |

### Optional Columns (for Energy Data):

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `voltage` | Number | Voltage in V | `230` |
| `current` | Number | Current in A | `54.3` |
| `power` | Number | Power in W | `12500` |
| `energy` | Number | Energy in kWh | `0.125` |
| `temperature` | Number | Temperature in °C | `28` |
| `humidity` | Number | Humidity in % | `60` |
| `occupancy` | 0 or 1 | Room occupancy | `1` |

---

## 📝 Example CSV File

```csv
timestamp,zone,category,value,source,voltage,current,power,energy,temperature,humidity,occupancy
2026-02-20T10:00:00Z,Block A,energy,12500,PZEM-004T,230,54.3,12500,0.125,28,60,1
2026-02-20T10:00:00Z,Block B,energy,18300,PZEM-004T,228,80.3,18300,0.183,29,62,1
2026-02-20T10:00:00Z,Hostel Zone,water,145,Flow Sensor,,,,,,,
2026-02-20T10:00:00Z,Main Campus,waste,65,Manual,,,,,,,
2026-02-20T10:00:00Z,Parking,transport,12,Manual,,,,,,,
2026-02-20T10:05:00Z,Block A,energy,12800,PZEM-004T,230,55.7,12800,0.128,28,61,1
2026-02-20T10:05:00Z,Block B,energy,18500,PZEM-004T,229,80.8,18500,0.186,29,62,0
```

**Download Example**: Click "Download Example" button in the Upload CSV tab

---

## 🔄 What Happens After Upload

### 1. Automatic Processing
- CSV file is parsed and validated
- Invalid rows are identified with error messages
- Valid data is processed immediately

### 2. Data Integration
- Energy data with full sensor info → Processed as ESP32 packets
- All formulas applied automatically:
  - Energy calculations
  - Carbon emissions
  - Wastage detection
  - Cost analysis

### 3. Real-Time Updates
All pages update instantly:

#### Dashboard
- Green Index Score recalculated
- Category cards show new data
- Latest alerts updated
- Financial metrics refreshed

#### Analytics
- Charts display new data points
- Trend lines updated
- Heatmap reflects new usage
- Insights regenerated

#### Alerts
- Wastage detection runs on new data
- New alerts generated if thresholds exceeded
- Alert history updated

#### Reports
- New data available for export
- Statistics recalculated
- Historical data updated

#### Leaderboard
- Rankings recalculated
- Scores updated
- Trends adjusted

---

## ✅ Upload Results

After upload, you'll see:

### Summary Statistics
- Total rows processed
- Valid rows count
- Invalid rows count
- Number of zones detected

### Category Breakdown
- Energy records
- Water records
- Waste records
- Transport records

### Date Range
- Start date/time
- End date/time

### Zones Detected
- List of all unique zones in your data

### Errors (if any)
- Row-by-row error messages
- Validation failures
- Format issues

---

## 🎨 Data Visualization

Your uploaded data appears in:

### Line Charts
- Green Index Trend
- Category Score Trends
- Energy consumption over time

### Area Charts
- Category breakdown stacked view
- Cumulative energy usage

### Bar Charts
- Penalties vs Credits
- Zone comparisons

### Heatmaps
- Peak usage patterns
- Time-based analysis

---

## 📊 Current Data Statistics

View real-time statistics:
- Total records in system
- Records by category
- Average values per category
- Records by zone

---

## 🔧 Advanced Features

### 1. Multiple Uploads
- Upload multiple CSV files
- Data is merged automatically
- Duplicates are handled

### 2. Data Validation
- Timestamp format checking
- Required field validation
- Value range validation
- Category validation

### 3. Error Handling
- Detailed error messages
- Row-by-row error reporting
- Partial upload support (valid rows processed)

### 4. Data Export
- Export processed data back to CSV
- Include calculated fields
- Filter by category or zone

---

## 🧪 Testing Your Upload

### Test Data Set 1: Energy Monitoring
```csv
timestamp,zone,category,value,source,voltage,current,power,energy,temperature,humidity,occupancy
2026-02-20T08:00:00Z,Lab 1,energy,8500,PZEM-004T,230,37,8500,0.085,26,55,1
2026-02-20T09:00:00Z,Lab 1,energy,12000,PZEM-004T,230,52,12000,0.205,27,56,1
2026-02-20T10:00:00Z,Lab 1,energy,15000,PZEM-004T,230,65,15000,0.355,28,58,1
2026-02-20T11:00:00Z,Lab 1,energy,14500,PZEM-004T,230,63,14500,0.500,29,60,1
2026-02-20T12:00:00Z,Lab 1,energy,13000,PZEM-004T,230,57,13000,0.630,30,62,1
```

### Test Data Set 2: Multi-Category
```csv
timestamp,zone,category,value,source
2026-02-20T10:00:00Z,Block A,energy,12500,PZEM-004T
2026-02-20T10:00:00Z,Block A,water,145,Flow Sensor
2026-02-20T10:00:00Z,Block A,waste,65,Manual
2026-02-20T10:00:00Z,Parking,transport,25,Manual
```

### Test Data Set 3: Wastage Detection
```csv
timestamp,zone,category,value,source,voltage,current,power,energy,temperature,humidity,occupancy
2026-02-20T14:00:00Z,Room 101,energy,800,PZEM-004T,230,3.5,800,0.8,28,60,0
2026-02-20T14:15:00Z,Room 101,energy,800,PZEM-004T,230,3.5,800,1.0,28,60,0
2026-02-20T14:30:00Z,Room 101,energy,800,PZEM-004T,230,3.5,800,1.2,28,60,0
```
*This should trigger wastage alerts (empty room with high power)*

---

## ⚠️ Common Issues

### Issue 1: "Missing required columns"
**Solution**: Ensure your CSV has all required columns: timestamp, zone, category, value, source

### Issue 2: "Invalid timestamp format"
**Solution**: Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`

### Issue 3: "Invalid rows"
**Solution**: Check the error messages for specific row numbers and issues

### Issue 4: "File too large"
**Solution**: Split large files into smaller chunks (max 10MB per file)

---

## 💡 Best Practices

### 1. Data Quality
- Use consistent zone names
- Ensure timestamps are in chronological order
- Validate data before upload
- Include all required fields

### 2. File Organization
- One file per day/week
- Separate files by category if needed
- Use descriptive filenames
- Keep backups of original files

### 3. Regular Uploads
- Upload data daily for best results
- Don't wait for large batches
- Monitor upload results
- Fix errors promptly

### 4. Data Validation
- Download example file first
- Test with small dataset
- Verify results in dashboard
- Check all pages for updates

---

## 🔐 Data Security

- CSV files are processed in-memory
- No data is sent to external servers
- All processing happens locally
- Data is stored in browser session
- Clear data when done

---

## 📈 Impact on Dashboards

### Dashboard Page
- ✅ Green Index Score updates
- ✅ Category cards refresh
- ✅ Alerts update
- ✅ Financial metrics recalculate

### Analytics Page
- ✅ All charts update with new data
- ✅ Trend lines adjust
- ✅ Heatmap reflects new patterns
- ✅ Insights regenerate

### Simulator Page
- ✅ Baseline data updates
- ✅ Predictions adjust
- ✅ Scenarios recalculate

### Leaderboard Page
- ✅ Rankings update
- ✅ Scores recalculate
- ✅ Badges adjust

### Alerts Page
- ✅ New alerts generated
- ✅ Wastage detection runs
- ✅ History updates

### Reports Page
- ✅ New data available
- ✅ Statistics update
- ✅ Export includes new data

---

## 🚀 Quick Tips

1. **Download Example First**: Always start with the example CSV
2. **Test Small**: Upload a small file first to verify format
3. **Check Results**: Review upload results before proceeding
4. **Monitor Dashboards**: Check all pages to see updates
5. **Clear When Done**: Clear data if testing or when finished

---

## 📞 Support

If you encounter issues:
1. Check error messages in upload results
2. Verify CSV format matches example
3. Ensure all required columns present
4. Check timestamp format
5. Try with example file first

---

## ✅ Checklist

Before uploading:
- [ ] CSV file has all required columns
- [ ] Timestamps are in ISO 8601 format
- [ ] Zone names are consistent
- [ ] Categories are valid (energy, water, waste, transport)
- [ ] Values are numeric
- [ ] File size is under 10MB
- [ ] Data is validated

After uploading:
- [ ] Check upload results
- [ ] Verify valid rows count
- [ ] Review any errors
- [ ] Check dashboard updates
- [ ] Verify analytics charts
- [ ] Confirm alerts generated
- [ ] Test data export

---

**Your CSV data is now integrated across the entire GreenIndex system! 🎉**
