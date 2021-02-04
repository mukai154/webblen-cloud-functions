function getMonthNum(month: string): number {
    if (month === 'Jan' || month === 'January') {
      return 0;
    } else if (month === 'Feb' || month === 'February') {
      return 1;
    } else if (month === 'Mar' || month === 'March') {
      return 2;
    } else if (month === 'Apr' || month === 'April') {
      return 3;
    } else if (month === 'May') {
      return 4;
    } else if (month === 'Jun' || month === 'June') {
      return 5;
    } else if (month === 'Jul' || month === 'July') {
      return 6;
    } else if (month === 'Aug' || month === 'August') {
      return 7;
    } else if (month === 'Sep' || month === 'Sept' ||  month === 'September') {
      return 8;
    } else if (month === 'Oct' || month === 'October') {
      return 9;
    } else if (month === 'Nov' || month === 'November') {
      return 10;
    } else if (month === 'Dec' || month === 'December') {
      return 11;
    } else {
      return 0;
    }
  }

function getTimeFromDateInMilliseconds(startDate: string, startTime: String) {
    const splitDate = startDate.split(/[ ,]+/);
  
    const newDate = new Date();
  
    const splitTime = startTime.split(/[: ]+/);

    let h = Number(splitTime[0]);
    if (h === 12 && (splitTime[2] === 'AM' || splitTime[2] === 'am')) {
      h = 0;
    } else if (h === 12 && (splitTime[2] === 'PM' || splitTime[2] === 'pm')) {
      h = 12;
    } else if (splitTime[2] === 'PM' || splitTime[2] === 'pm') {
      h += 12;
    } else {
      h = h;
    }
  
    const m = Number(splitTime[1]);
    
    if (splitDate.length === 4) {
      newDate.setDate(Number(splitDate[2]));
      newDate.setMonth(getMonthNum(splitDate[1]));
      newDate.setFullYear(Number(splitDate[3]));
    }
    if (splitDate.length === 3) {
      newDate.setDate(Number(splitDate[1]));
      newDate.setMonth(getMonthNum(splitDate[0]));
      newDate.setFullYear(Number(splitDate[2]));
    }
    
    newDate.setHours((h - 5), m, 0, 0);
  
    return newDate.getTime();
  }