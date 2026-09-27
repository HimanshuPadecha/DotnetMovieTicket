namespace Ticket_Management_System.Models;

public class Booking
{
    public int Id { get; set; }
    public string BookingCode { get; set; } = null!;
    public int UserId { get; set; }
    public int ShowId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "CONFIRMED"; // CONFIRMED, CANCELLED
    public DateTime BookedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Show Show { get; set; } = null!;
    public ICollection<BookingSeat> BookingSeats { get; set; } = new List<BookingSeat>();
}
