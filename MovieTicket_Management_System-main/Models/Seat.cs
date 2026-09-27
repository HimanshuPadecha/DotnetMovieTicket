namespace Ticket_Management_System.Models;

public class Seat
{
    public int Id { get; set; }
    public int ScreenId { get; set; }
    public string SeatNumber { get; set; } = null!; // e.g. A1, B5
    public string SeatType { get; set; } = "REGULAR"; // REGULAR, PREMIUM

    public Screen Screen { get; set; } = null!;
    public ICollection<BookingSeat> BookingSeats { get; set; } = new List<BookingSeat>();
}
