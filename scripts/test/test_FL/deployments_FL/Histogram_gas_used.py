import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from matplotlib.ticker import FuncFormatter

# Load the CSV file into a DataFrame
data = pd.read_csv('/home/fjaved/demos/hardhat-polygon/test/test_FL/registration__seq_50x10_log.csv')

# Filter the data for the first iteration
iteration_1_data = data[data['Iteration'] == 1]

# Define a custom formatter to convert float values into integers on x-axis
def custom_formatter(x, pos):
    return f"{int(x)}"

# Plot the normalized histogram using Seaborn
plt.figure(figsize=(5, 5))
sns.histplot(iteration_1_data['Gas Used'], bins=10, color='#3066BE', edgecolor='black', stat='percent')
plt.xlabel('Gas Used')
plt.ylabel('Percentage')

# Set the formatter for x-axis
ax = plt.gca()
ax.xaxis.set_major_formatter(FuncFormatter(custom_formatter))

# Adding a text box for total count
plt.text(
    0.80, 0.94,
    r'$AE_n = 50$'.format(len(data)),
    transform=plt.gca().transAxes,
    fontsize=11,
    bbox=dict(facecolor='white', alpha=0.2)
)

# Save the plot as a PNG file
plt.savefig('/home/fjaved/demos/hardhat-polygon/test/test_FL/Plots_FL/histogram_gas_used_registeration.png')
plt.savefig('/home/fjaved/demos/hardhat-polygon/test/test_FL/Plots_FL/histogram_gas_used_registeration.svg')

# Print a message indicating that the file has been saved
print('/home/fjaved/demos/hardhat-polygon/test/test_FL/Plots_FL/Histogram saved as histogram_gas_used_registeration.png')
