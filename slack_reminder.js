import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Helper function to generate a random time within a specified range for a given date
const getRandomTime = (date, startHour, endHour) => {
    const randomHour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);

    const sendDateTime = new Date(date);
    sendDateTime.setHours(randomHour, randomMinute, randomSecond, 0); // Set hours, minutes, seconds, milliseconds
    return sendDateTime;
};

// Component for creating a new reminder
const ReminderForm = ({ onAddReminder, slackWebhookUrl, onUpdateWebhookUrl }) => {
    const [message, setMessage] = useState('');
    const [sendDate, setSendDate] = useState(''); // Stores date in YYYY-MM-DD format
    const [recurrenceType, setRecurrenceType] = useState('one-time'); // State for recurrence
    const [webhookUrlInput, setWebhookUrlInput] = useState(slackWebhookUrl);
    const [startHour, setStartHour] = useState(9); // New state for start hour
    const [endHour, setEndHour] = useState(19);   // New state for end hour

    // Update webhook URL input field if the global webhook URL changes
    useEffect(() => {
        setWebhookUrlInput(slackWebhookUrl);
    }, [slackWebhookUrl]);

    // Handles the form submission to schedule a new reminder
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Basic validation
        if (!message.trim() || !sendDate || !webhookUrlInput.trim()) {
            alert('Please fill in all fields and provide a Slack Webhook URL.');
            return;
        }
        if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23 || startHour > endHour) {
            alert('Please set a valid time range (Start Hour must be less than or equal to End Hour, and between 0-23).');
            return;
        }


        const reminderDate = new Date(sendDate + 'T00:00:00'); // Ensure date is parsed correctly in local timezone
        if (isNaN(reminderDate.getTime())) {
            alert('Invalid date. Please use YYYY-MM-DD format.');
            return;
        }

        // Generate a random time for the reminder using the specified range
        const scheduledTime = getRandomTime(reminderDate, startHour, endHour);

        // Add the new reminder to the list
        onAddReminder({
            id: uuidv4(), // Generate a unique ID for the reminder
            message,
            initialSendDate: sendDate, // Store original date string for recurrence
            currentScheduledTime: scheduledTime.toISOString(), // Store exact scheduled time as ISO string for consistency
            status: 'pending', // Initial status
            slackWebhookUrl: webhookUrlInput, // Store webhook URL with the reminder
            recurrenceType: recurrenceType, // Store the selected recurrence type
            lastSentTime: null, // Initialize last sent time
            startHour, // Store custom start hour
            endHour,   // Store custom end hour
        });

        // Update the global webhook URL if the user changed it in the form
        if (webhookUrlInput !== slackWebhookUrl) {
            onUpdateWebhookUrl(webhookUrlInput);
        }

        // Clear form fields after submission (optional, can keep for quick re-scheduling)
        setMessage('');
        setSendDate('');
        setRecurrenceType('one-time'); // Reset recurrence type
        // Keep start/end hours as they might be commonly used
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-xl space-y-4 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Set a New Reminder</h2>
            <div>
                <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700">
                    Slack Incoming Webhook URL:
                </label>
                <input
                    type="url"
                    id="webhook-url"
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    placeholder="e.g., https://hooks.slack.com/services/T.../B.../..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Get this URL by creating an Incoming Webhook for a Slack App: <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">api.slack.com/apps</a>
                </p>
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Reminder Message:
                </label>
                <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="e.g., Don't forget to submit the monthly report!"
                    required
                ></textarea>
            </div>
            <div>
                <label htmlFor="send-date" className="block text-sm font-medium text-gray-700">
                    Send Date:
                </label>
                <input
                    type="date"
                    id="send-date"
                    value={sendDate}
                    onChange={(e) => setSendDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    required
                />
            </div>
            <div className="flex space-x-4">
                <div className="flex-1">
                    <label htmlFor="start-hour" className="block text-sm font-medium text-gray-700">
                        Send Time Start (Hour 0-23):
                    </label>
                    <input
                        type="number"
                        id="start-hour"
                        value={startHour}
                        onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
                        min="0"
                        max="23"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        required
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="end-hour" className="block text-sm font-medium text-gray-700">
                        Send Time End (Hour 0-23):
                    </label>
                    <input
                        type="number"
                        id="end-hour"
                        value={endHour}
                        onChange={(e) => setEndHour(parseInt(e.target.value, 10))}
                        min="0"
                        max="23"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">
                    Recurrence:
                </label>
                <select
                    id="recurrence"
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                >
                    <option value="one-time">One-time</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
            >
                Schedule Reminder
            </button>
        </form>
    );
};

// Component for displaying a single reminder item
const ReminderItem = ({ reminder, onUpdateReminderStatus, onRescheduleReminder }) => {
    const scheduledTime = new Date(reminder.currentScheduledTime);
    const now = new Date();

    // Handler for "Task Done" button
    const handleDone = () => {
        onUpdateReminderStatus(reminder.id, 'done');
    };

    // Handler for "Remind Me Again in X hours"
    const handleRemindAgainInHours = (hours) => {
        const newTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
        onRescheduleReminder(reminder.id, newTime.toISOString(), reminder.startHour, reminder.endHour);
    };

    // Handler for "Remind Me Again Tomorrow"
    const handleRemindAgainTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        // Use the reminder's specific start/end hours for tomorrow's random time
        const newScheduledTime = getRandomTime(tomorrow, reminder.startHour, reminder.endHour).toISOString();
        onRescheduleReminder(reminder.id, newScheduledTime, reminder.startHour, reminder.endHour);
    };

    const isSent = reminder.status === 'sent';
    const isDone = reminder.status === 'done';

    // Dynamic styling based on reminder status
    const statusColor = {
        pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        sent: 'bg-blue-50 border-blue-200 text-blue-800',
        done: 'bg-green-50 border-green-200 text-green-800',
        rescheduled: 'bg-purple-50 border-purple-200 text-purple-800',
    };

    return (
        <div className={`p-4 rounded-lg shadow-sm mb-4 border ${statusColor[reminder.status]}`}>
            <p className="font-semibold text-lg text-gray-900">{reminder.message}</p>
            <p className="text-sm text-gray-700">
                Scheduled for: {scheduledTime.toLocaleDateString()} at {scheduledTime.toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-700">
                Status: <span className="font-medium capitalize">{reminder.status}</span>
                {reminder.recurrenceType !== 'one-time' && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full capitalize">
                        {reminder.recurrenceType}
                    </span>
                )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
                Send Time Range: {reminder.startHour}:00 - {reminder.endHour}:00
            </p>


            {/* Show action buttons only if the reminder has been sent and not yet marked as done */}
            {isSent && !isDone && (
                <div className="mt-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                        onClick={handleDone}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium transition duration-150 ease-in-out transform hover:scale-105"
                    >
                        <span className="mr-2">✅</span> Task Done
                    </button>
                    <div className="flex-1 flex flex-col space-y-2">
                        <button
                            onClick={() => handleRemindAgainInHours(1)}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition duration-150 ease-in-out transform hover:scale-105"
                        >
                            <span className="mr-2">⏰</span> Remind in 1 Hr
                        </button>
                        <button
                            onClick={() => handleRemindAgainInHours(4)}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition duration-150 ease-in-out transform hover:scale-105"
                        >
                            <span className="mr-2">⏰</span> Remind in 4 Hrs
                        </button>
                        <button
                            onClick={handleRemindAgainTomorrow}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition duration-150 ease-in-out transform hover:scale-105"
                        >
                            <span className="mr-2">🗓️</span> Remind Tomorrow
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main App component
const App = () => {
    // State to hold all reminders, initialized from localStorage
    const [reminders, setReminders] = useState(() => {
        try {
            const storedReminders = localStorage.getItem('slackReminders');
            if (storedReminders) {
                const parsed = JSON.parse(storedReminders);
                // Ensure scheduledTime is converted back to ISO string if needed, or handled as Date objects
                return parsed.map(r => ({
                    ...r,
                    // Handle potential old data structure without currentScheduledTime
                    currentScheduledTime: r.currentScheduledTime || r.scheduledTime,
                    // Ensure recurrenceType, lastSentTime, startHour, endHour exist for old reminders
                    recurrenceType: r.recurrenceType || 'one-time',
                    lastSentTime: r.lastSentTime || null,
                    startHour: r.startHour !== undefined ? r.startHour : 9, // Default to 9 if not present
                    endHour: r.endHour !== undefined ? r.endHour : 19,     // Default to 19 if not present
                }));
            }
        } catch (e) {
            console.error("Failed to parse reminders from localStorage:", e);
        }
        return [];
    });

    // State to hold the Slack Webhook URL, initialized from localStorage
    const [slackWebhookUrl, setSlackWebhookUrl] = useState(() => {
        try {
            return localStorage.getItem('slackWebhookUrl') || '';
        } catch (e) {
            console.error("Failed to load webhook URL from localStorage:", e);
            return '';
        }
    });

    // Effect to save reminders to localStorage whenever the reminders state changes
    useEffect(() => {
        localStorage.setItem('slackReminders', JSON.stringify(reminders));
    }, [reminders]);

    // Effect to save the Slack Webhook URL to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('slackWebhookUrl', slackWebhookUrl);
    }, [slackWebhookUrl]);

    // Callback to add a new reminder
    const addReminder = useCallback((newReminder) => {
        setReminders((prevReminders) => [...prevReminders, newReminder]);
    }, []);

    // Callback to update a reminder's status
    const updateReminderStatus = useCallback((id, newStatus) => {
        setReminders((prevReminders) =>
            prevReminders.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
    }, []);

    // Callback to reschedule a reminder (used by "Remind Me Again" options)
    const rescheduleReminder = useCallback((id, newScheduledTime, startH, endH) => {
        setReminders((prevReminders) =>
            prevReminders.map((r) =>
                r.id === id
                    ? {
                        ...r,
                        currentScheduledTime: newScheduledTime,
                        status: 'rescheduled',
                        // Update start/end hours if provided, otherwise keep existing
                        startHour: startH !== undefined ? startH : r.startHour,
                        endHour: endH !== undefined ? endH : r.endHour,
                    }
                    : r
            )
        );
    }, []);

    // Callback function to send a message to Slack via the webhook
    const sendSlackMessage = useCallback(async (reminder) => {
        if (!reminder.slackWebhookUrl || reminder.slackWebhookUrl === "YOUR_SLACK_WEBHOOK_URL_HERE") {
            console.error("Slack Webhook URL is not configured for this reminder. Message not sent to Slack.");
            return;
        }

        const payload = {
            text: reminder.message,
            username: "My Personal Reminder Bot",
            icon_emoji: ":bell:", // A bell emoji icon for the bot
        };

        try {
            const response = await fetch(reminder.slackWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                console.log(`Successfully sent reminder "${reminder.message}" to Slack.`);
            } else {
                const errorText = await response.text();
                console.error(`Failed to send reminder to Slack: ${response.status} ${response.statusText}. Response: ${errorText}`);
            }
        } catch (error) {
            console.error('Error sending message to Slack:', error);
        }
    }, []);

    // Effect to periodically check for reminders to send
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setReminders((prevReminders) => {
                let updatedReminders = [...prevReminders];
                updatedReminders.forEach((reminder, index) => {
                    const scheduledTime = new Date(reminder.currentScheduledTime);

                    // Only process pending or rescheduled reminders whose time has passed
                    if ((reminder.status === 'pending' || reminder.status === 'rescheduled') && now >= scheduledTime) {
                        // Send the message
                        sendSlackMessage(reminder);

                        // Create a copy to update
                        const updatedReminder = { ...reminder, status: 'sent', lastSentTime: now.toISOString() };

                        // Handle recurrence
                        if (reminder.recurrenceType === 'monthly') {
                            let nextDate = new Date(scheduledTime); // Base next date on the *just sent* scheduled time
                            nextDate.setMonth(nextDate.getMonth() + 1); // Advance to next month

                            // Generate a new random time for the next occurrence using the reminder's stored range
                            const newScheduledTime = getRandomTime(nextDate, reminder.startHour, reminder.endHour);
                            updatedReminder.currentScheduledTime = newScheduledTime.toISOString();
                            updatedReminder.status = 'pending'; // Set back to pending for the next cycle
                        }
                        // For 'one-time' reminders, the status remains 'sent' and no further scheduling occurs.

                        updatedReminders[index] = updatedReminder;
                    }
                });
                return updatedReminders;
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [sendSlackMessage]); // Re-run effect if sendSlackMessage changes (though it's memoized)

    // Filter and sort reminders for display
    const pendingReminders = reminders.filter(r => r.status === 'pending' || r.status === 'rescheduled').sort((a, b) => new Date(a.currentScheduledTime) - new Date(b.currentScheduledTime));
    const sentReminders = reminders.filter(r => r.status === 'sent').sort((a, b) => new Date(b.currentScheduledTime) - new Date(a.currentScheduledTime)); // Newest first
    const completedReminders = reminders.filter(r => r.status === 'done').sort((a, b) => new Date(b.currentScheduledTime) - new Date(a.currentScheduledTime)); // Newest first

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-10 px-4 font-inter text-gray-900">
            {/* Tailwind CSS Script - Must be loaded for styling */}
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Configure Tailwind to use Inter font */}
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                }
                `}
            </style>

            <div className="max-w-3xl w-full space-y-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-8 leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">
                        Personal Slack Reminder Bot
                    </span>
                </h1>

                {/* Reminder Form Section */}
                <ReminderForm
                    onAddReminder={addReminder}
                    slackWebhookUrl={slackWebhookUrl}
                    onUpdateWebhookUrl={setSlackWebhookUrl}
                />

                {/* Upcoming Reminders Section */}
                <div className="mt-10 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Reminders</h2>
                    {pendingReminders.length === 0 ? (
                        <p className="text-gray-600 italic">No pending reminders. Set one above!</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingReminders.map((reminder) => (
                                <ReminderItem
                                    key={reminder.id}
                                    reminder={reminder}
                                    onUpdateReminderStatus={updateReminderStatus}
                                    onRescheduleReminder={rescheduleReminder}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Sent Reminders Section */}
                <div className="mt-10 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Sent Reminders (Awaiting Action)</h2>
                    {sentReminders.length === 0 ? (
                        <p className="text-gray-600 italic">No reminders sent yet or all acted upon.</p>
                    ) : (
                        <div className="space-y-4">
                            {sentReminders.map((reminder) => (
                                <ReminderItem
                                    key={reminder.id}
                                    reminder={reminder}
                                    onUpdateReminderStatus={updateReminderStatus}
                                    onRescheduleReminder={rescheduleReminder}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Reminders Section */}
                <div className="mt-10 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Completed Reminders</h2>
                    {completedReminders.length === 0 ? (
                        <p className="text-gray-600 italic">No reminders completed yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {completedReminders.map((reminder) => (
                                <ReminderItem
                                    key={reminder.id}
                                    reminder={reminder}
                                    onUpdateReminderStatus={updateReminderStatus}
                                    onRescheduleReminder={rescheduleReminder}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
