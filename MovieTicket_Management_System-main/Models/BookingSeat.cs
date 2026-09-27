namespace Ticket_Management_System.Models;

public class BookingSeat
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int SeatId { get; set; }

    public Booking Booking { get; set; } = null!;
    public Seat Seat { get; set; } = null!;
}
