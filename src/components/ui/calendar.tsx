import { DayPicker } from "react-day-picker";
import "react-day-picker/src/style.css";
import "../../styles/calendar.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar(props: CalendarProps) {
  return <DayPicker showOutsideDays {...props} />;
}

Calendar.displayName = "Calendar";

export { Calendar };
